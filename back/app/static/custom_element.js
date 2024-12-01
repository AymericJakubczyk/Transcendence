class MyTest extends HTMLElement {
    constructor(value) {
        super();
        console.log(this)
    
        // this.shadowRoot.innerHTML = '<p>Hello, World!</p>';
      }

    connectedCallback() {
        console.log('Custom element added to page!', this.getAttribute('test'));
        this.innerHTML = `<p>Hello, World!</p>`;
    }
}

window.customElements.define('custom-test', MyTest);

class MyDiscu extends HTMLElement {
    constructor(value) {
        super();
    }

    connectedCallback() {
        console.log('Custom element added to page!');

        let sender = this.getAttribute('sender');
        let discu_id = this.getAttribute('discu_id');
        let msg = this.getAttribute('msg');
        let img = this.getAttribute('img');
        this.innerHTML = `
            <form id="form_discu_${sender}" hx-post="/chat/" hx-push-url="true" hx-target="#page" hx-swap="innerHTML" hx-indicator="#content-loader">
				<input type="hidden" name="change_discussion" value="${discu_id}">
				<button id="discu_${sender}" data-id="${discu_id}" value="${sender}" class="rounded-2 my-1 p-2 discu" type="submit">
					<div id="profile_pic_${sender}" style="position: relative;">
						<img src="${img}" class="pp" alt="Profile Picture">
					</div>
					<div class="d-flex flex-column mx-2" style="overflow: hidden;">
                        <div class="d-flex align-items-center">
                                <span class="pe-2" style="font-size: 24px; font-weight: 400;color:#ffffff; text-align: start;text-overflow: ellipsis;">
                                    ${sender}
                                </span>
                                <div id="statut_${sender}" class="rounded-circle" style="background-color:green; width:15px; height:15px; aspect-ratio:1"></div>
                            </div>
						<span id="last_msg_${sender}" style="font-size: 14px; font-weight: 100; color:#c0c0c0 ;padding-left: 5px;text-align: start;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:100%">
							${msg}
						</span>
					</div>
				</button>
			</form>
        `;
    }
}


class MyMiniDiscu extends HTMLElement {
    constructor(value) {
        super();
    }

    connectedCallback() {
        console.log('Custom element added to page!');

        let sender = this.getAttribute('sender');
        let discu_id = this.getAttribute('discu_id');
        let msg = this.getAttribute('msg');
        let img = this.getAttribute('img');
        this.innerHTML = `
            <button id="btn_discu_mini_${sender}" onclick="display_mini_discu('${sender}', ${discu_id})" class="rounded-2 my-1 p-1 discu">
                <div id="profile_pic_mini_${sender}" style="position: relative;">
                    <img src="${img}" class="pp" alt="Profile Picture">
                </div>
                <div class="d-flex flex-column mx-2" style="overflow: hidden;">
                    <div class="d-flex align-items-center">
                        <span class="pe-1" style="font-size: 24px; font-weight: 400;color:#ffffff; text-align: start;text-overflow: ellipsis;">
                            ${sender}
                        </span>
                        <div id="statut_mini_${sender}" class="rounded-circle" style="background-color:green; width:15px; height:15px; aspect-ratio:1"></div>
                    </div>
                    <span id="last_msg_mini_${sender}" style="font-size: 14px; font-weight: 100; color:#c0c0c0 ;padding-left: 5px;text-align: start;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:100%">
                        ${msg}
                    </span>
                </div>
            </button>
        `;
    }
}

window.customElements.define('custom-discu', MyDiscu);
window.customElements.define('custom-mini-discu', MyMiniDiscu);


