import nodemailer from "nodemailer";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const isDev = process.env.NODE_ENV !== "production";
if (isDev) dotenv.config();

// note: general app setup
const app = express();
app.use(express.json());

// note: CORS config
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  "*",
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// note: supabase admin client
const hasSupabase =
  !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  hasSupabase ?
    createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )
  : null;

// note: general helpers

const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

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

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  requireTLS: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  logger: true,
  debug: true,
});

// note: unifed sending function, create link
const sendVerificationEmail = async (toEmail, rawToken) => {
  const link = new URL("/verify-email", FRONTEND_URL);
  link.searchParams.set("token", rawToken);

  const verificationLink = link.toString();

  const mailOptions = {
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Confirm your email",
    text:
      `Thanks for signing up!\n\n` +
      `Please confirm your email by visiting the link below:\n` +
      `${verificationLink}\n\n` +
      `The link is valid for 24 hours.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.4;">
        <h2>Thanks for signing up!</h2>
        <p>Please confirm your email by clicking the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationLink}" target="_blank" rel="noopener noreferrer"
            style="display:inline-block; background-color:#2563eb; color:#fff; padding:12px 22px; text-decoration:none; border-radius:6px; font-weight:600;">
            Confirm email
          </a>
        </div>
        <p>If the button does not work, copy and paste the link below into your browser:</p>
        <p style="word-break:break-all;"><a href="${verificationLink}">${verificationLink}</a></p>
        <p style="color:#6b7280; font-size:12px; margin-top:18px;">This link is valid for 24 hours.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent:", info.messageId);
  return info;
};

// note: ащк еуыешта

app.get("/health-check", (req, res) => {
  console.log("Health-check route was called!");
  res.json({ status: "ok" });
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
      console.error("sendVerificationEmail error (full):", mailErr);
      return res.status(500).json({
        success: false,
        error: "Failed to send email",
        details: mailErr && mailErr.message ? mailErr.message : String(mailErr),
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

    // note: find all with status "unverified"
    const { data: users, error: fetchErr } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("status", "unverified");

    if (fetchErr) throw fetchErr;

    if (!users?.length) {
      return res.json({
        success: true,
        requested: [],
        auth_deleted: [],
        auth_delete_failed: [],
      });
    }

    const ids = users.map((u) => u.id);

    // // note: delete form auth
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

    // note: delete from users
    const { error: tableErr } = await supabaseAdmin
      .from("users")
      .delete()
      .in("id", ids);

    if (tableErr) throw tableErr;

    // note: front nefine the user was deleted or not
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

// note: global error handler
app.use((err, req, res, next) => {
  console.error("EXPRESS ERROR:", err?.stack || err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
