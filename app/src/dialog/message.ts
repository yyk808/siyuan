import {genUUID} from "../util/genID";
import {Constants} from "../constants";

export const initMessage = () => {
    const messageElement = document.getElementById("message");
    if (!messageElement) {
        console.error('[initMessage] #message element not found');
        return;
    }

    messageElement.innerHTML = '<div class="fn__flex-1"></div>';
    messageElement.addEventListener("click", (event) => {
        let target = event.target as HTMLElement;
        while (target && !target.isEqualNode(messageElement)) {
            if (target.classList.contains("b3-snackbar__close")) {
                hideMessage(target.parentElement.getAttribute("data-id"));
                event.preventDefault();
                break;
            } else if (target.tagName === "A" || target.tagName === "BUTTON") {
                break;
            } else if (target.classList.contains("b3-snackbar")) {
                if (getSelection().rangeCount === 0 || !getSelection().getRangeAt(0).toString()) {
                    hideMessage(target.getAttribute("data-id"));
                }
                event.preventDefault();
                event.stopPropagation();
                break;
            }
            target = target.parentElement;
        }
    });

    // 处理在初始化之前就存在的 tempMessages
    const tempMessages = document.getElementById("tempMessage");
    if (tempMessages) {
        const tempItems = tempMessages.querySelectorAll("div");
        if (tempItems.length > 0) {
            console.log(`[initMessage] Processing ${tempItems.length} temp messages`);
            tempItems.forEach((item) => {
                const timeout = parseInt(item.getAttribute("data-timeout")) || 6000;
                const type = item.getAttribute("data-type") || "info";
                const messageId = item.getAttribute("data-message-id");
                showMessage(item.innerHTML, timeout, type, messageId);
                item.remove();
            });
        }
    }
};

// type: info/error; timeout: 0 手动关闭；-1 永不关闭
export const showMessage = (message: string, timeout = 6000, type = "info", messageId?: string) => {
    // 尝试获取消息容器
    let messagesElement = document.getElementById("message")?.firstElementChild;

    // 如果容器不存在或为空，尝试自动初始化
    if (!messagesElement) {
        console.warn(`[showMessage] Message container not available, attempting auto-initialization`);
        const messageContainer = document.getElementById("message");
        if (messageContainer) {
            // 自动初始化消息容器
            messageContainer.innerHTML = '<div class="fn__flex-1"></div>';
            messagesElement = messageContainer.firstElementChild;
            console.log(`[showMessage] Auto-initialized message container`);

            // 添加事件监听器
            messageContainer.addEventListener("click", (event) => {
                let target = event.target as HTMLElement;
                while (target && !target.isEqualNode(messageContainer)) {
                    if (target.classList.contains("b3-snackbar__close")) {
                        hideMessage(target.parentElement.getAttribute("data-id"));
                        event.preventDefault();
                        break;
                    } else if (target.tagName === "A" || target.tagName === "BUTTON") {
                        break;
                    } else if (target.classList.contains("b3-snackbar")) {
                        if (getSelection().rangeCount === 0 || !getSelection().getRangeAt(0).toString()) {
                            hideMessage(target.getAttribute("data-id"));
                        }
                        event.preventDefault();
                        event.stopPropagation();
                        break;
                    }
                    target = target.parentElement;
                }
            });

            console.log(`[showMessage] Added event listener to message container`);
        } else {
            console.error(`[showMessage] Cannot find message container for auto-initialization`);
        }
    }

    // 如果仍然没有容器，使用 tempMessage 作为后备方案
    if (!messagesElement) {
        console.log(`[showMessage] Fallback to tempMessages. timeout: ${timeout}, type: ${type}`);
        let tempMessages = document.getElementById("tempMessage");
        if (!tempMessages) {
            document.body.insertAdjacentHTML("beforeend", `<div style="font-size: 14px;top: 22px;position: fixed;z-index: 100;right: 30px;line-height: 20px;word-break: break-word;display: flex;flex-direction: column;align-items: flex-end;"
id="tempMessage"></div>`);
            tempMessages = document.getElementById("tempMessage");
        }
        const tempId = messageId || genUUID();
        const messageDiv = document.createElement("div");
        messageDiv.style.cssText = "background: var(--b3-tooltips-background, rgba(30, 30, 30, 0.95));padding: 8px 16px;border-radius: 6px;margin-bottom: 16px;cursor: pointer;color: var(--b3-theme-on-primary, #fff);box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);";
        messageDiv.setAttribute("data-timeout", timeout.toString());
        messageDiv.setAttribute("data-type", type);
        messageDiv.setAttribute("data-message-id", tempId);
        messageDiv.innerHTML = message;

        // 添加点击事件，点击时隐藏消息
        messageDiv.addEventListener("click", () => {
            messageDiv.remove();
        });

        tempMessages.appendChild(messageDiv);

        // 设置自动隐藏定时器
        if (timeout > 0) {
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    messageDiv.remove();
                }
            }, timeout);
        }

        return tempId;
    }
    const id = messageId || genUUID();
    const existElement = messagesElement.querySelector(`.b3-snackbar[data-id="${id}"]`);
    const messageVersion = message + (type === "error" ? " v" + Constants.SIYUAN_VERSION : "");
    if (existElement) {
        window.clearTimeout(parseInt(existElement.getAttribute("data-timeoutid")));
        existElement.innerHTML = `<div data-type="textMenu" class="b3-snackbar__content${timeout === 0 ? " b3-snackbar__content--close" : ""}">${messageVersion}</div>${timeout === 0 ? '<svg class="b3-snackbar__close"><use xlink:href="#iconCloseRound"></use></svg>' : ""}`;
        if (type === "error") {
            existElement.classList.add("b3-snackbar--error");
        } else {
            existElement.classList.remove("b3-snackbar--error");
        }
        if (timeout > 0) {
            const timeoutId = window.setTimeout(() => {
                hideMessage(id);
            }, timeout);
            existElement.setAttribute("data-timeoutid", timeoutId.toString());
        }
        return;
    }
    let messageHTML = `<div data-id="${id}" class="b3-snackbar--hide b3-snackbar${type === "error" ? " b3-snackbar--error" : ""}"><div data-type="textMenu" class="b3-snackbar__content${timeout === 0 ? " b3-snackbar__content--close" : ""}">${messageVersion}</div>`;
    if (timeout === 0) {
        messageHTML += '<svg class="b3-snackbar__close"><use xlink:href="#iconCloseRound"></use></svg>';
    } else if (timeout !== -1) { // -1 时需等待请求完成后手动关闭
        const timeoutId = window.setTimeout(() => {
            hideMessage(id);
        }, timeout);
        messageHTML = messageHTML.replace("<div data-id", `<div data-timeoutid="${timeoutId}" data-id`);
    }
    messagesElement.parentElement.classList.add("b3-snackbars--show");
    messagesElement.parentElement.style.zIndex = (++window.siyuan.zIndex).toString();
    messagesElement.insertAdjacentHTML("afterbegin", messageHTML + "</div>");
    setTimeout(() => {
        messagesElement.querySelectorAll(".b3-snackbar--hide").forEach(item => {
            item.classList.remove("b3-snackbar--hide");
        });
    });
    if (messagesElement.firstElementChild.nextElementSibling &&
        messagesElement.firstElementChild.nextElementSibling.innerHTML === messagesElement.firstElementChild.innerHTML) {
        messagesElement.firstElementChild.nextElementSibling.remove();
    }
    messagesElement.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    return id;
};

export const hideMessage = (id?: string) => {
    const messagesElement = document.getElementById("message").firstElementChild;
    if (!messagesElement) {
        return;
    }
    if (id) {
        const messageElement = messagesElement.querySelector(`[data-id="${id}"]`);
        if (messageElement) {
            messageElement.classList.add("b3-snackbar--hide");
            window.clearTimeout(parseInt(messageElement.getAttribute("data-timeoutid")));
            setTimeout(() => {
                messageElement.remove();
                if (messagesElement.childElementCount === 0) {
                    messagesElement.parentElement.classList.remove("b3-snackbars--show");
                    messagesElement.innerHTML = "";
                }
            }, Constants.TIMEOUT_INPUT);
        }
        let hasShowItem = false;
        Array.from(messagesElement.children).find(item => {
            if (!item.classList.contains("b3-snackbar--hide")) {
                hasShowItem = true;
                return true;
            }
        });
        if (hasShowItem) {
            messagesElement.parentElement.classList.add("b3-snackbars--show");
        } else {
            messagesElement.parentElement.classList.remove("b3-snackbars--show");
        }
    } else {
        messagesElement.parentElement.classList.remove("b3-snackbars--show");
        setTimeout(() => {
            messagesElement.innerHTML = "";
        }, Constants.TIMEOUT_INPUT);
    }
};
