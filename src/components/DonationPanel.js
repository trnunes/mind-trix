import React, { useState } from "react";

function DonationPanel() {
  const [isVisible, setIsVisible] = useState(true);

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
      </div>
    </div>
  );
}

export default DonationPanel;
