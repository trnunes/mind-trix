import React, { useState } from "react";
import qrCodeImage from "../assets/pix.jpeg"; // Add the path to your QR code image

function DonationDialog({ isOpen, onClose }) {
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isOpen) return null;

  const handlePixDonation = () => {
    setShowQrCode(!showQrCode);
  };

  const handlePayPalClick = () => {
    window.open(
      "https://www.paypal.com/donate/?hosted_button_id=2DQB3P8HRP6EL",
      "_blank"
    );
  };

  return (
    <div className="donation-dialog-overlay">
      <div className="donation-dialog">
        <button className="dialog-close-button" onClick={onClose}>
          X
        </button>
        <h2>Support Our App</h2>
        <p>
          We hope you’re enjoying using this app! It’s free to use, but there
          are costs involved in keeping it running, like server expenses and
          development time. If you find the app useful, consider making a
          donation to help us continue improving and maintaining it.
        </p>
        <div className="donation-options">
          <button
            onClick={handlePayPalClick}
            className="donation-button paypal"
          >
            Donate with PayPal
          </button>
          <button onClick={handlePixDonation} className="donation-button pix">
            Donate with Pix
          </button>
        </div>

        {showQrCode && (
          <div className="qr-code-container">
            <img src={qrCodeImage} alt="Pix QR Code" />
          </div>
        )}

        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  );
}

export default DonationDialog;
