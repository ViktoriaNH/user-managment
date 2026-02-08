import nodemailer from "nodemailer";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";


console.log("Starting server...");
console.log("PORT from env:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "exists" : "MISSING");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "exists" : "MISSING");

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// note: general app setup
const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  }),
);
app.use(express.json());

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.exit(1);
}

// note: supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// note: general helpers
const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// important: returns SHA-256 hex hash of a string token, use for secure token storage in supabse
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// note: unified nodemailer transporter
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const SMTP_SECURE =
  process.env.SMTP_SECURE ?
    process.env.SMTP_SECURE === "true"
  : SMTP_PORT === 465;

const isProd = process.env.NODE_ENV === "production";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
  socketTimeout: 20000,
});

// note: unifed sending function, create link to BACKEND_URL/verify-email (not FRONTEND)
const sendVerificationEmail = async (toEmail, rawToken) => {
  const verificationLink = `${BACKEND_URL}/verify-email?token=${rawToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"My App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Подтвердите ваш email",
    text:
      `Спасибо за регистрацию!\n\n` +
      `Пожалуйста, подтвердите email, перейдя по ссылке ниже:\n` +
      `${verificationLink}\n\n` +
      `Ссылка действительна 24 часа.`,
    html: `
      <h2>Спасибо за регистрацию!</h2>
      <p>Подтвердите свой email, нажав на кнопку ниже:</p>
      <p style="margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">
          Подтвердить email
        </a>
      </p>
      <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p style="color: #777; font-size: 14px;">Ссылка действительна 24 часа.</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

// important: need delete users from 2 tables in SB
app.post("/delete-users", async (req, res) => {
  try {
    const { ids, currentEmail } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided" });
    }

    const { data: records, error: selErr } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .in("id", ids);

    if (selErr) {
      throw selErr;
    }

    // const isSelf = !!currentEmail && records.some(r => r.email === currentEmail);

    // note: delete from auth
    const failed = [];
    const succeeded = [];
    for (const id of ids) {
      try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) {
          failed.push({ id, error: error.message ?? error });
        } else {
          succeeded.push(id);
        }
      } catch (e) {
        failed.push({ id, error: e.message ?? e });
      }
    }

    // note: delete from users
    const { error: tableErr } = await supabaseAdmin
      .from("users")
      .delete()
      .in("id", ids);

    if (tableErr) {
      throw tableErr;
    }

    return res.json({
      success: true,
      requested: ids,
      auth_deleted: succeeded,
      auth_delete_failed: failed,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message ?? err });
  }
});

// note: delete all unverified users
app.post("/delete-unverified", async (req, res) => {
  try {
    const { currentEmail } = req.body;

    // Находим всех с status = "unverified"
    const { data: users, error: fetchErr } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("status", "unverified");

    if (fetchErr) throw fetchErr;

    // Если никого нет — сразу успех
    if (!users?.length) {
      return res.json({
        success: true,
        requested: [],
        auth_deleted: [],
        auth_delete_failed: [],
      });
    }

    const ids = users.map((u) => u.id);

    // Удаляем из auth
    const failed = [];
    const succeeded = [];

    for (const id of ids) {
      try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) {
          failed.push({ id, error: error.message || error });
        } else {
          succeeded.push(id);
        }
      } catch (e) {
        failed.push({ id, error: e.message || String(e) });
      }
    }

    // Удаляем из таблицы users
    const { error: tableErr } = await supabaseAdmin
      .from("users")
      .delete()
      .in("id", ids);

    if (tableErr) throw tableErr;

    // Ответ без isSelf — фронт сам определит, был ли удалён текущий пользователь
    return res.json({
      success: true,
      requested: ids,
      auth_deleted: succeeded,
      auth_delete_failed: failed,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || "Внутренняя ошибка сервера",
    });
  }
});

// note: create token, save hash in email_verifications
app.post("/send-verification", async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: "userId and email required",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_MS).toISOString();

    // note: add user to users table
    // important: default set status 'unverified'
    const { error: upsertErr } = await supabaseAdmin
      .from("users")
      .upsert([{ id: userId, email, status: "unverified" }], {
        onConflict: ["id"],
      });
    if (upsertErr) {
      return res
        .status(500)
        .json({ success: false, error: upsertErr.message ?? upsertErr });
    }

    // note: add to email_verifications
    const { error: insertErr } = await supabaseAdmin
      .from("email_verifications")
      .insert([
        {
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      ]);
    if (insertErr) {
      return res
        .status(500)
        .json({ success: false, error: insertErr.message ?? insertErr });
    }

    // note: send email
    try {
      await sendVerificationEmail(email, rawToken);
    } catch (mailErr) {
      return res.status(500).json({
        success: false,
        error: "Failed to send email",
        details: mailErr.message ?? mailErr,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("token required");

    const tokenHash = hashToken(String(token));

    const { data: rows, error } = await supabaseAdmin
      .from("email_verifications")
      .select("*")
      .eq("token_hash", tokenHash)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .limit(1);

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=0`);
    }

    if (!rows || rows.length === 0) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=0`);
    }

    const record = rows[0];

    await supabaseAdmin
      .from("email_verifications")
      .update({ used: true })
      .eq("id", record.id);

    await supabaseAdmin
      .from("users")
      .update({ status: "active" })
      .eq("id", record.user_id);

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=1`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=0`);
  }
});

// app.listen(PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
