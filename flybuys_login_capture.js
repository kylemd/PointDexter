// @name Flybuys Auth Extractor (Post-SMS)
// @description Waits for redirect after SMS verify, then saves code + tokens
// @version 1.2
// @match *://auth.flybuys.com.au/*

(function () {
  // Utility: dump matching items from storage
  const collectStorage = () => {
    const dump = {};

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

    return dump;
  };

  // Utility: write dump to text file
  const writeToFile = (text) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlBlob;
    a.download = "flybuys-auth-dump.txt";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
  };

  let alreadyFired = false;

  const checkForAuthCode = () => {
    if (alreadyFired) return;
    const currentUrl = new URL(window.location.href);
    const code = currentUrl.searchParams.get("code");

    if (code) {
      alreadyFired = true;

      const dump = collectStorage();
      dump.auth_code = code;

      const text = Object.entries(dump)
        .map(([k, v]) => `${k}:\n${v}\n`)
        .join("\n");

      writeToFile(text);
      alert("Flybuys token data saved to file.");
    }
  };

  // Run on page load
  checkForAuthCode();

  // Monitor URL changes (for SPA/WebView redirects)
  const oldPushState = history.pushState;
  const oldReplaceState = history.replaceState;

  const patchHistoryMethod = (method) => function () {
    const ret = method.apply(this, arguments);
    setTimeout(checkForAuthCode, 500);
    return ret;
  };

  history.pushState = patchHistoryMethod(oldPushState);
  history.replaceState = patchHistoryMethod(oldReplaceState);
  window.addEventListener("popstate", checkForAuthCode);
})();
