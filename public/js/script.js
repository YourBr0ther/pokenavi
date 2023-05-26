window.onload = function() {
  document.getElementById('toggle-button').addEventListener('click', function() {
      var panel = document.getElementById('chat-panel');
      if (panel.classList.contains('open')) {
          panel.classList.remove('open');
      } else {
          panel.classList.add('open');
      }
  });
}