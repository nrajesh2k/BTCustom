let hostedFieldsInstance;
const submitButton = document.getElementById('submit-button');
const resultDiv = document.getElementById('result');

function showResult(message, isError) {
  resultDiv.textContent = message;
  resultDiv.className = isError ? 'error' : 'success';
}

async function init() {
  submitButton.disabled = true;

  const res = await fetch('/client_token');
  const { clientToken } = await res.json();

  braintree.client.create({ authorization: clientToken }, (err, clientInstance) => {
    if (err) {
      console.error(err);
      showResult('Failed to initialize payment client.', true);
      return;
    }

    braintree.hostedFields.create(
      {
        client: clientInstance,
        styles: {
          input: { 'font-size': '14px', color: '#333' },
          '.invalid': { color: '#b3261e' },
        },
        fields: {
          number: { selector: '#card-number', placeholder: '4111 1111 1111 1111' },
          expirationDate: { selector: '#expiration-date', placeholder: 'MM/YY' },
          cvv: { selector: '#cvv', placeholder: 'CVV' },
        },
      },
      (hfErr, instance) => {
        if (hfErr) {
          console.error(hfErr);
          showResult('Failed to load card fields.', true);
          return;
        }
        hostedFieldsInstance = instance;
        submitButton.disabled = false;
      }
    );
  });
}

submitButton.addEventListener('click', async () => {
  if (!hostedFieldsInstance) return;
  submitButton.disabled = true;

  hostedFieldsInstance.tokenize(async (err, payload) => {
    if (err) {
      console.error(err);
      showResult(err.message || 'Card details are invalid.', true);
      submitButton.disabled = false;
      return;
    }

    const amount = document.getElementById('amount').value;
    const cardholderName = document.getElementById('cardholder-name').value;

    try {
      const res = await fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodNonce: payload.nonce,
          amount,
          cardholderName,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showResult(`Payment successful! Transaction ID: ${data.transactionId}`, false);
      } else {
        showResult(data.message || 'Payment failed.', true);
      }
    } catch (e) {
      console.error(e);
      showResult('Network error while processing payment.', true);
    } finally {
      submitButton.disabled = false;
    }
  });
});

init();
