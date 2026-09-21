import { useEffect, useState } from "react";
import { sendContact } from "../contact-service";
export default function Contact() {
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const [status, setStatus] = useState({ message: "", type: "" }),
    [submitting, setSubmitting] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form),
      payload = Object.fromEntries(
        ["name", "email", "message"].map((key) => [
          key,
          String(data.get(key) || "").trim(),
        ]),
      );
    if (Object.values(payload).some((value) => !value)) {
      setStatus({ message: "Please fill in all fields.", type: "error" });
      return;
    }
    setSubmitting(true);
    setStatus({ message: "", type: "" });
    try {
      await sendContact(payload);
      form.reset();
      setStatus({
        message: "Message sent. I will get back to you soon.",
        type: "success",
      });
    } catch {
      setStatus({
        message: "Could not send the message. Please email info@remione.ltd.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section id="contact" className="contact-section">
      <div className="contact-intro">
        <h2>Let’s talk.</h2>
        <p>
          Have a question or an idea?
          <br />
          We’d love to hear from you.
        </p>
        <a className="text-link" href="mailto:info@remione.ltd">
          info@remione.ltd <span aria-hidden="true">↗</span>
        </a>
      </div>
      <form onSubmit={submit}>
        <noscript>
          <p className="form-status">
            Please email <a href="mailto:info@remione.ltd">info@remione.ltd</a>{" "}
            to get in touch.
          </p>
        </noscript>
        <label>
          Name
          <input
            type="text"
            name="name"
            placeholder="Your name"
            autoComplete="name"
            maxLength="120"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            maxLength="180"
            required
          />
        </label>
        <label>
          Message
          <textarea
            name="message"
            placeholder="What’s on your mind?"
            maxLength="2000"
            rows="3"
            required
          />
        </label>
        <button
          className="button"
          type="submit"
          disabled={!interactive || submitting}
        >
          {submitting ? "Sending..." : "Send message"}{" "}
          <span aria-hidden="true">→</span>
        </button>
        <p
          className={`form-status ${status.type}`}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      </form>
    </section>
  );
}
