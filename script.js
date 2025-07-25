(function () {
    if (!window.jQuery) {
        const script = document.createElement("script");
        script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
        script.onload = start;
        document.head.appendChild(script);

    } else {
        start();
    }

    function start() {
        const classes = {
            appendLocation: "ins-api-users"
        }

        const selectors = {
            appendLocation: `.${classes.appendLocation}`
        }

        const appendLocation = selectors.appendLocation;

        const config = {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === "childList") {
                    mutation.removedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList.contains("userCard")) {
                            const noUsersLeft = $('.userCard').length === 0;
                            const isClickedBefore = sessionStorage.getItem("reloadClickedOnce") === "true";
                            const reloadBtnExists = $("#reloadBtn").length > 0;

                            if (noUsersLeft && !isClickedBefore && !reloadBtnExists) {
                                showReloadButton();
                            }
                        }
                    });
                }
            });
        });

        const addUser = () => {
            if (!$(appendLocation).length) {
                const container = $(`<div class="${classes.appendLocation}"></div>`);
                $("body").append(container);
            }
            const watchedElement = document.querySelector(`.${classes.appendLocation}`);
            if (watchedElement) {
                observer.observe(watchedElement, config);
            }
        };

        const makeCSS = () => {
            const style = `    
    body {
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }

    .userCard {
      border: 1px solid gray;
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 6px;
      background-color: white;
      box-shadow: black;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .userCard.hovered {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 4px 8px black;
    }

    .userCard h3 {
      margin: 0  6px;
    }
    .userCard p {
      margin: 4px 0;
    }

     .deleteBtn {
      display: inline-block;
      margin-top: 8px;
      padding: 8px 16px;
      background-color: purple;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
    }
    .deleteBtn:hover {
      background-color: pink;
    } 

    #reloadBtn {
      padding: 10px 20px;
      background-color: purple;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      margin-top: 12px;
    }

    #reloadBtn:hover {
      background-color: pink;
    }`;

            $("<style>").text(style).appendTo("head");
        };

        const oneDay = 24 * 60 * 60 * 1000;


        const getUsers = async () => {
            const users = localStorage.getItem("users");

            if (users) {
                const savedUsers = JSON.parse(users);

                if (savedUsers.timestamp && Date.now() - savedUsers.timestamp < oneDay) {
                    showUsers(savedUsers.data);
                    return;
                }
            }

            try {
                console.log("Veri çekiliyor");
                const response = await fetch("https://jsonplaceholder.typicode.com/users");
                if (response.status !== 200) {
                    alert("Sunucu hatası! Durum kodu: " + response.status);
                    return;
                }

                const data = await response.json();
                const newUsers = {
                    data: data,
                    timestamp: Date.now()
                };

                localStorage.setItem("users", JSON.stringify(newUsers));
                showUsers(data);
                console.log(data);

            } catch (error) {
                console.error("Hata: " + error);
                alert("Sayfaya ulaşılamadı");
            }
        };


        const showUsers = (savedUsers) => {
            $(appendLocation).empty();
            for (let i = 0; i < savedUsers.length; i++) {
                const savedUser = savedUsers[i];

                const div = `<div class="userCard" data-id="${savedUser.id}">  
                <p>Kullanıcı Adı: ${savedUser.username}</p>
                <p>Email: ${savedUser.email}</p>
                <p>Adres: ${savedUser.address.street}, ${savedUser.address.city}</p>    
                <button class = "deleteBtn" data-id=${savedUser.id}>Sil</button>
                </div> `
                $(appendLocation).append(div);
            }
        }

        $(document).on("click", ".deleteBtn", function () {
            deleteUser($(this).data("id"));
        });

        const deleteUser = (id) => {
            $(`.userCard[data-id="${id}"]`).remove();
            const stored = JSON.parse(localStorage.getItem("users"));
            const updatedData = (stored?.data || []).filter(user => user.id !== id);
            const newStored = {
                data: updatedData,
                timestamp: stored.timestamp
            };

            localStorage.setItem("users", JSON.stringify(newStored));
        }

        const showReloadButton = () => {
            const isClickedBefore = sessionStorage.getItem("reloadClickedOnce");
            const reloadBtnExists = $("#reloadBtn").length > 0;
            if (isClickedBefore === "true" || reloadBtnExists)
                return;
            const button = $(`<button id="reloadBtn">Kullanıcıları Yeniden Getir</button>`);
            $(appendLocation).append(button);
        };

        $(document).on("click", "#reloadBtn", function () {
            sessionStorage.setItem("reloadClickedOnce", "true");
            localStorage.removeItem("users");
            getUsers();
            $(this).remove();
        });

        $(appendLocation).on("mouseenter mouseleave", ".userCard", function () {
            $(this).toggleClass("hovered");
        });

        $(function () {
            makeCSS();
            addUser();
            getUsers();
        });
    }
})();