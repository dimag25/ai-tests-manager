

    function openTab(evt, tabName) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (location.hash === "#RunTests") {
            openTab(event, 'RunTests');
            fetchTests();
        } else {
            openTab(event, 'Generate');
        }
    });

   


    // Run fetchTests on page load for RunTests tab
    document.addEventListener('DOMContentLoaded', function() {
        fetchTests();
        openTab(event, 'Generate'); // Open Generate tab by default
    });




function showMessage(text, isSuccess = true) {
    let msg = document.createElement('div');
    msg.className = 'message' + (isSuccess ? '' : ' error');
    msg.textContent = text;
    document.body.appendChild(msg);
    msg.style.display = 'block';
    setTimeout(() => msg.remove(), 3000);
}