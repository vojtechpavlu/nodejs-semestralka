
      export const openNav = () => {
        document.getElementById('sidebar-header').classList.remove('sidebar-header-closed');
        document.getElementById('sidebar-header').classList.add('sidebar-header-open');
        let element = document.getElementById('overlay-element');
        element.style.width = '30%';
        let button = document.getElementById('sidebar-toggle-btn');
        let replaceButton = button.cloneNode(true);
        replaceButton.addEventListener('click', closeNav);
        replaceButton.classList.add('sidebar-toggle-btn');
        button.parentNode.replaceChild(replaceButton, button);
        showDetail('block');
        document.getElementById('overlay-element').classList.remove('overlay-closed');
        document.getElementById('overlay-element').classList.add('overlay-open');
      }

      export const closeNav = () => {
        document.getElementById('sidebar-header').classList.remove('sidebar-header-open');
        document.getElementById('sidebar-header').classList.add('sidebar-header-closed');
        let element = document.getElementById('overlay-element');
        element.style.width = '3vw';
        let button = document.getElementById('sidebar-toggle-btn');
        let replaceButton = button.cloneNode(true);
        replaceButton.addEventListener('click', openNav);
        replaceButton.classList.add('sidebar-toggle-btn');
        button.parentNode.replaceChild(replaceButton, button);
        showDetail('none');
        document.getElementById('overlay-element').classList.remove('overlay-open');
        document.getElementById('overlay-element').classList.add('overlay-close');
      }

      export const showDetail = (value) => {
        for (let e of document.getElementsByClassName('sidebar-control-name')) {
          e.style.display = value;
        };
        for (let e of document.getElementsByClassName('sidebar-content')) {
            e.style.display = value ;
        };
      }
      document.getElementById('sidebar-toggle-btn').addEventListener('click', openNav);
      openNav();
      closeNav();
      showDetail('none')