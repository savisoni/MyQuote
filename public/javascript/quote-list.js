$(document).ready(function () {
    function getQuotes(queryParams) {
      $.ajax({
        url: `/quote/all/?${$.param(queryParams)}`,
        type: 'GET',
        success: function (data) {
          
                const response = $(data);
           
const newQuotesHTML = response.find('.quote-row').html();
console.log("new-------", newQuotesHTML);

            $(".quote-row").html(newQuotesHTML);



        // location.reload();
        },
        error: function (error) {
          console.error(error);
        },
      });
    }


$('#searchButton').click(function () {
    const searchKey = $('#searchInput').val(); 
    const queryParams = { searchKey };
    window.history.pushState({}, '', '?' + $.param(queryParams));
    getQuotes(queryParams);
  });


  
$('.sortButton').click(function () {
  const sortBy = $(this).attr('name');
  const sortOrder = 'desc';
  const queryParams = { sortBy, sortOrder };
  window.history.pushState({}, '', '?' + $.param(queryParams));
  getQuotes(queryParams);
});

$("#check-btn").on("change", function () {
  let isChecked = $('#check-btn').is(":checked");
let collaborationMode="collaborationMode";
  console.log("isChecked---", isChecked);
  let queryParams;
  if (isChecked) {
      queryParams={collaborationMode:true};
      console.log("queryParams=========" , queryParams);
  }


  getQuotes(queryParams);

})

});


