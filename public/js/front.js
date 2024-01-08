$(document).ready(function () {
   //alert("$(document).ready");

    // ------------------------------------------------------- //
    // Custom Scrollbar
    // ------------------------------------------------------ //

    // if ($(window).outerWidth() > 992) {
    //     $("nav.side-navbar").mCustomScrollbar({
    //         scrollInertia: 200
    //     });
    // }

    // ------------------------------------------------------- //
    // Side Navbar Functionality
    // ---------;--------------------------------------------- //

    // var tm = $('#toggle-menu');
    // if (tm) {
    //     alert(tm.length)
    // }
    // $(tm).on('click', function (e) {
    $(document).on('click','#toggle-menu', function (e) {
        
       // console.log("$('#toggle-btn')", $('#toggle-btn'));
        e.preventDefault();

        if ($(window).outerWidth() > 1194) {
            $('nav.side-navbar').toggleClass('shrink');
            $('nav.navbar').toggleClass('navlarge');
            $('.page').toggleClass('active');
        }
        else {
            $('nav.side-navbar').toggleClass('show-sm');
            $('nav.navbar').toggleClass('navshrink');
            $('.page').toggleClass('active-sm');
        }
    });

});
