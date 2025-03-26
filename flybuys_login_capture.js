// @name Flybuys Auth Extractor to File
// @description Captures auth code, tokens, verifiers and saves as a file
// @version 1.1
// @match *://auth.flybuys.com.au/*

(function() {
  const dump = {};

  // Extract the authorization code from the URL
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  if (code) {
    dump.auth_code = code;
  }

  // Grab likely keys from localStorage / sessionStorage
  try {
    for (let k of Object.keys(localStorage)) {
      if (/verifier|token|auth|pkce/i.test(k)) {
        dump["localStorage:" + k] = localStorage.getItem(k);
      }
    }
    for (let k of Object.keys(sessionStorage)) {
      if (/verifier|token|auth|pkce/i.test(k)) {
        dump["sessionStorage:" + k] = sessionStorage.getItem(k);
      }
    }
  } catch (e) {
    dump.error = e.toString();
  }

  // Format as plain text
  const output = Object.entries(dump)
    .map(([k, v]) => `${k}:\n${v}\n`)
    .join("\n");

  // Create and download the blob file
  const blob = new Blob([output], { type: 'text/plain' });
  const urlBlob = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = urlBlob;
  a.download = "flybuys-auth-dump.txt";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  alert("Flybuys token data saved as a text file.");

})();
