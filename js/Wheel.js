$('[data-js="wheel"]').each(function() {
  const $wheel = $(this);
  const $wheelSVG = $wheel.find(".wheel");
  const $ballSVG = $wheel.find(".ball");

  let timeout;

  window.wheel = {
    spin: () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      $wheelSVG.removeClass("spin");
      $ballSVG.removeClass("spin-opposite");

      setTimeout(() => {
        $wheelSVG.addClass("spin");
        $ballSVG.addClass("spin-opposite");

        timeout = setTimeout(() => {
          $wheelSVG.removeClass("spin");
          $ballSVG.removeClass("spin-opposite");
        }, 2000);
      }, 10);
    }
  };
});
