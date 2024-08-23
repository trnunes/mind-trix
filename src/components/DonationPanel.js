import React, { useState } from "react";
import qrCodeImage from "../assets/pix.jpeg"; // Path to your QR code image

function DonationPanel() {
  const [isVisible, setIsVisible] = useState(true);
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="donation-panel">
      <button className="close-button" onClick={() => setIsVisible(false)}>
        ×
      </button>
      <h4>Support Us</h4>
      <p>
        This app is free and doesn't monetize Ads, but you can help keep it
        running by donating. Every contribution counts!
      </p>
      <div className="donation-options">
        <button
          onClick={() =>
            window.open(
              "https://www.paypal.com/donate/?hosted_button_id=2DQB3P8HRP6EL"
            )
          }
          className="donation-button paypal"
        >
          Donate with PayPal
        </button>
        <button
          onClick={() => setShowQrCode(!showQrCode)}
          className="donation-button pix"
        >
          Donate with Pix
        </button>
      </div>

      {showQrCode && (
        <div className="qr-code-container">
          <img src={qrCodeImage} alt="Pix QR Code" />
        </div>
      )}
    </div>
  );
}

export default DonationPanel;
