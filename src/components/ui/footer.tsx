import { useState } from "react";
import LegalPage from "../legal-page"; // Adjust path as needed

export default function Footer() {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <footer className="mx-90 font-thin flex flex-col md:flex-row items-center justify-between px-8 text-[#F9FAFB]/50 text-sm py-6 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-white/10 gap-4 md:gap-0">
        <span>
          &copy; {new Date().getFullYear()} GlossX Claw. All rights reserved.
        </span>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setModalType("privacy")}
            className="cursor-pointer hover:text-[#FF007F] transition-colors duration-200"
          >
            Privacy Policy
          </button>

          <span className="text-gray-700">•</span>

          <button
            onClick={() => setModalType("terms")}
            className="cursor-pointer hover:text-[#FF007F] transition-colors duration-200"
          >
            Terms of Service
          </button>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <LegalPage
        title="Privacy Policy"
        lastUpdated="October 26, 2026"
        isOpen={modalType === "privacy"}
        onClose={() => setModalType(null)}
      >
        <p>
          At <strong>Glossx Claw</strong> ("we," "us," or "our"), we respect
          your privacy and are committed to protecting your personal data. This
          Privacy Policy explains how we collect, use, and safeguard your
          information when you use our booking platform.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          To provide a secure and legitimate booking experience, we collect the
          following:
        </p>
        <ul>
          <li>
            <strong>Booking & Verification Data:</strong> Your Name and
            Instagram handle. We use your Instagram handle to verify that the
            booking is legitimate and to communicate with you.
          </li>
          <li>
            <strong>Authentication Data:</strong> Because our system requires an
            account to book, we securely process your login credentials.
          </li>
          <li>
            <strong>Health & Safety Notes:</strong> Any health issues, skin
            allergies, or sensitivities you voluntarily provide in the booking
            notes so we can accommodate you safely.
          </li>
          <li>
            <strong>Usage Data:</strong> Basic technical logs automatically
            collected by our hosting provider.
          </li>
        </ul>

        <h2>2. Studio Location Privacy</h2>
        <p>
          For the safety and privacy of our operations, the exact physical
          location of the Glossx Claw studio is{" "}
          <strong>not publicly displayed</strong>. The address will only be
          revealed to you via your account/booking confirmation{" "}
          <strong>
            after your booking request has been officially approved
          </strong>
          .
        </p>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To verify your identity and prevent spam or fake bookings.</li>
          <li>To manage your appointments, cancellations, and rescheduling.</li>
          <li>
            To communicate important details (like the studio address) once your
            booking is approved.
          </li>
          <li>
            To ensure your safety by reviewing any allergy or health notes
            before your service begins.
          </li>
        </ul>

        <h2>4. Third-Party Services</h2>
        <p>
          We use trusted third-party providers to run our website and booking
          system:
        </p>
        <ul>
          <li>
            <strong>Vercel:</strong> Our website hosting and analytics provider,
            which may collect basic server logs.
          </li>
          <li>
            <strong>Supabase:</strong> Our secure database and authentication
            provider, which stores your account data and booking details.
          </li>
        </ul>
        <p>
          We do not sell, rent, or trade your personal information to third
          parties.
        </p>

        <h2>5. Payments</h2>
        <p>
          Currently, all payments for services are processed{" "}
          <strong>in-person at the studio</strong>. We do not collect or store
          credit card information on this website. (Note: This policy will be
          updated if we introduce online advanced cashless payments in the
          future).
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or your data, please
          contact us via Instagram:
          <br />
          <strong>Instagram:</strong>{" "}
          <a
            href="https://www.instagram.com/glossx.claw/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF007F] hover:underline"
          >
            @glossx.claw
          </a>
        </p>
      </LegalPage>

      {/* Terms of Service Modal */}
      <LegalPage
        title="Terms of Service"
        lastUpdated="October 26, 2026"
        isOpen={modalType === "terms"}
        onClose={() => setModalType(null)}
      >
        <p>
          Welcome to <strong>Glossx Claw</strong>. By booking an appointment
          with us, you agree to the following Terms of Service. Please read them
          carefully before booking.
        </p>

        <h2>1. Booking & Verification</h2>
        <p>
          A registered account is required to book an appointment. You must
          provide your real name and a valid Instagram account. We reserve the
          right to decline or cancel any booking if the provided information is
          found to be false or unverifiable. The studio address will only be
          provided upon booking approval.
        </p>

        <h2>2. Cancellations & Late Arrivals</h2>
        <ul>
          <li>
            <strong>Cancellations:</strong> Because your slot is reserved and
            approved specifically for you, a cancellation fee will apply if you
            cancel after your booking is approved. Details of the fee will be
            discussed via Instagram DMs upon cancellation.
          </li>
          <li>
            <strong>Late Arrivals:</strong> If you arrive 15 to 30 minutes late
            (or later), an automatic <strong>Late Arrival Fee</strong> will be
            added to your final payment after the service is completed.
          </li>
        </ul>

        <h2>3. Repair Policy</h2>
        <p>
          We stand by the quality of our work. If there is an issue with the
          nails directly caused by our application, we offer a{" "}
          <strong>Free Repair</strong>. Please contact us via Instagram within a
          reasonable timeframe to schedule a fix.
        </p>
        <p>
          <em>
            Note: Free repairs do not apply if the damage is caused by client
            actions (e.g., using nails as tools, improper care, picking at the
            nails).
          </em>
        </p>

        <h2>4. Age Requirement</h2>
        <p>
          Clients under the age of 18 must be accompanied by a parent or legal
          guardian during the appointment.
        </p>

        <h2>5. Health, Allergies, & Safety</h2>
        <p>
          Your safety is important to us. If you have any skin allergies, health
          issues, or sensitivities related to nail products, tools, or
          chemicals,{" "}
          <strong>you must disclose this in the booking notes</strong>. We will
          review your notes and take necessary precautions before starting your
          service. Glossx Claw is not liable for allergic reactions or injuries
          resulting from undisclosed health conditions.
        </p>

        <h2>6. Payments</h2>
        <p>
          Currently, all payments are made{" "}
          <strong>in-person at the studio</strong> after the service is
          completed. We are working on integrating online cashless payment
          options for advanced booking in the future.
        </p>

        <h2>7. Contact</h2>
        <p>
          For any questions regarding these terms, please reach out to us on
          Instagram:{" "}
          <a
            href="https://www.instagram.com/glossx.claw/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF007F] hover:underline"
          >
            @glossx.claw
          </a>
        </p>
      </LegalPage>
    </>
  );
}
