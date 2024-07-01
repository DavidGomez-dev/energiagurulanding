/*!
 * Start Bootstrap - New Age v6.0.7 (https://startbootstrap.com/theme/new-age)
 * Copyright 2013-2023 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
 */
//
// Scripts
//

window.addEventListener("DOMContentLoaded", (event) => {
  // Activate Bootstrap scrollspy on the main nav element
  const mainNav = document.body.querySelector("#mainNav");
  if (mainNav) {
    new bootstrap.ScrollSpy(document.body, {
      target: "#mainNav",
      offset: 74,
    });
  }

  // Collapse responsive navbar when toggler is visible
  const navbarToggler = document.body.querySelector(".navbar-toggler");
  const responsiveNavItems = [].slice.call(document.querySelectorAll("#navbarResponsive .nav-link"));
  responsiveNavItems.map(function (responsiveNavItem) {
    responsiveNavItem.addEventListener("click", () => {
      if (window.getComputedStyle(navbarToggler).display !== "none") {
        navbarToggler.click();
      }
    });
  });

  // Cambiar los badges en funcion del sistema operativo

  function getMobileOS() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/Windows|windows/.test(userAgent) && !window.MSStream) {
      return "windows";
    }

    if (/android/i.test(userAgent)) {
      return "Android";
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }

    return "Unknown";
  }

  const downpwa = document.getElementById("downpwa");
  const downandroid = document.getElementById("downandroid");
  const downios = document.getElementById("downios");

  const os = getMobileOS();

  switch (os) {
    case "Android":
      // Mostrar el enlace de Google Play y ocultar otros
      downios.classList.add("d-none", "d-md-inline");
      downpwa.classList.add("d-none", "d-md-inline");
      break;

    case "iOS":
      // Mostrar el enlace de App Store y ocultar otros
      console.log("Ios mobile");

      downpwa.classList.add("d-none", "d-md-inline");
      downandroid.classList.add("d-none", "d-md-inline");
      break;

    default:
      console.log("Unkown mobile");
      downios.classList.add("d-none", "d-md-inline");
      downandroid.classList.add("d-none", "d-md-inline");
      break;
  }
});
