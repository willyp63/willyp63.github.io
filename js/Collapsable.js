$('[data-js="collapsable"]').each(function() {
  const $collapsable = $(this);
  const $button = $collapsable.find(".collapse-button");
  const $buttonIcon = $button.find("span");
  const $content = $collapsable.find(".collapse-content");

  var contentHeight = $content[0].clientHeight;
  $content.height(0);

  $button.on('click', function() {
    $content.height($content.height() ? 0 : contentHeight);
    $buttonIcon.text($buttonIcon.text() === "+" ? "-" : "+");
  });
});
