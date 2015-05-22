var tweetstorm = require('tweetstorm');

window.onload = function() {
  var longtweet = document.getElementById('longtweet');
  var preview = document.getElementById('preview');
  var previewContainer = document.getElementById('preview-container');
  function recalculate(e) {
    if (longtweet.value) {
      previewContainer.style.display = '';
      var tweets = tweetstorm(longtweet.value);
      preview.innerHTML = '<ul>';
      for(var i in tweets) {
        preview.innerHTML += '<li>' + tweets[i] + '</li>';
      }
      preview.innerHTML += '</ul>';
    } else {
      previewContainer.style.display = 'none';
    }
  }
  longtweet.oninput = recalculate;
  longtweet.onpropertychange = recalculate;
};

function submitStorm() {
  var textarea = document.getElementById('longtweet');
  var btn = document.getElementById('submitbtn');
  var text = textarea.value;

  if (text) {
    btn.disabled = true;
    btn.innerHTML = 'Posting...';
    btn.classList.remove('button-primary');
    textarea.disabled = true;
    atomic.post('/tweetstorm', 'text=' + text)
    .success(function (data, xhr) {
      var tweets = data.tweets;
      console.log(tweets);
      document.getElementById('submitform').style.display = 'none';
      for(var i in tweets) {
        createTweet(tweets[i].id_str);
      }
      document.getElementById('posted').style.display = '';
    })
    .error(function (data, xhr) {
      alert('Something went wrong!');
    });
  } else {
    alert('You must enter something to tweet first.');
  }
}

function createTweet(id) {
  twttr.widgets.createTweet(
  id,
  document.getElementById('tweet-container'),
  { align: 'center' });
}
