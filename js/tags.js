$(document).ready(function() {
  let currentTag = "";  
  var url_string = window.location.href;
  var url = new URL(url_string);
  var tag_nm = url.searchParams.get("tag");
  if (tag_nm) {
    currentTag = tag_nm;
    filterByTagName(currentTag)
  }
});

$("[data-tag]").click((e) => {
  currentTag = e.target.dataset.tag;
  filterByTagName(currentTag);
})

function tag_post(data){
  location.href = '/posts?tag='+data+'';
}

function filterByTagName(tagName) {
  $('.hidden').removeClass('hidden');
  $('.post-wrapper').each((index, elem) => {
    if (!elem.hasAttribute(`data-${tagName}`)){
      $(elem).addClass('hidden');
    }
  });
  $(`.tag`).removeClass('selected');
  $(`.tag[data-tag=${tagName}]`).addClass('selected');
}

function getUrlParams() {     
  var params = {};  
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, 
    function(str, key, value) { 
        params[key] = value; 
      }
  );      
  return params; 
}