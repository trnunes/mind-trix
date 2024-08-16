import React from "react";

function DonationDialog({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="donation-dialog-overlay">
      <div className="donation-dialog">
        <h2>Support Our App</h2>
        <p>
          We hope you’re enjoying using this app! It’s free to use, but there
          are costs involved in keeping it running, like server expenses and
          development time. If you find the app useful, consider making a
          donation to help us continue improving and maintaining it.
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
        </div>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  );
}

export default DonationDialog;
