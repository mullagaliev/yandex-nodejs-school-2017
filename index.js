"use strict";

let MyForm = {
	/*
		private
	*/
	_$form : undefined,
	$form : function(){
		if(this._$form === undefined){
			this._$form = document.getElementById('myForm');
		}
		return this._$form;
	},
	_inputsNameList: ["fio", "phone", "email"],
	_validateInput: function(input){
		function validateFio(value){
			return value && value.match(/[а-я\w]+/g).length === 3;
		}
		/**
		 * Function for validate email 
		 * @source http://www.w3resource.com/javascript/form/email-validation.php
		 */
		function ValidateEmail(value){
			return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
		}
		function validateEmailInDomains(value, domains ){
			return domains.indexOf(value.split('@')[1]) > -1;
		}
		function validatePhone(value){
			let phoneRegexp = new RegExp(/^(\+7)\(\d{3}\)\d{3}(?:-\d{2}){2}$/);
			return phoneRegexp.test(value);
		}
		function validateSumNumbersPhone(value){
			let numbers = value.match(/\d/g);
			let sum = numbers.reduce((sum, val)=>{
				return sum + Number(val);
			}, 0);

			return sum <= 30;
		}

		// Only for not password filds 
		let val = input.value.trim();

		switch(input.name) {
			case  "fio" :
				return validateFio(val);
			case "email" :
				return ValidateEmail(val) && validateEmailInDomains(val, ["ya.ru","yandex.ru","yandex.ua","yandex.by","yandex.kz","yandex.com"]);
			case "phone" :
				return validatePhone(val) && validateSumNumbersPhone(val);
			default: 
				return true;
		}
	},
	_enableSend : function(mod){
		let submitButton = document.getElementById("submitButton");
		
		if(mod){
			submitButton.removeAttribute("disabled");
		}
		else{
			submitButton.setAttribute("disabled", "disabled");
		}
	},
	_updateStatus : function($container, text, className){
		$container.classList.add(className);
		$container.textContent = text;
	},
	_requestForm : function(action, form, formData, $resultContainer){
		$resultContainer.classList.remove("success", "error", "progress");
		form._enableSend(false);

		let request = new XMLHttpRequest();
		request.onreadystatechange = function(){
			if (this.readyState === 4 && this.status !== 200) {
				form._enableSend(true);
			}
			if (this.readyState === 4 && this.status === 200) {
				let json = JSON.parse(this.responseText);
				
				switch(json.status) {
					case "success":
						form._updateStatus($resultContainer, "Success", "success");
						form._enableSend(true);
						break;
					case "error":
						let reason = json.reason ? json.reason : "empty";
						form._updateStatus($resultContainer, reason, "error");
						form._enableSend(true);
						break;
					case "progress":
						form._updateStatus($resultContainer, "", "progress");
						let timeout = json.timeout ? Number(json.timeout) : 1000;
						setTimeout(form.submit.bind(form), timeout ); 
						break;
					default: 
						form._updateStatus($resultContainer, "", "");
						form._enableSend(true);
						break;
				}
			}
		};
		request.open("GET", action, true);
		request.send(formData);
	},
	/*
		public
	*/
	validate : function(){
		let result = {
			isValid : true,
			errorFields : []
		};
		let data = this.getData();

		for (let key in data) {
			let $input = this.$form().querySelector("[name='" + key + "']");
			if( $input === null ){
				continue;
			}
			//@TODO Add other method for hilight
			$input.classList.remove('error');

			let chkValidInput = this._validateInput($input);
			result.isValid &= chkValidInput;

			if( !chkValidInput ){
				$input.classList.add('error');
				result.errorFields.push(key);
			}
		}
		return result;
	},
	getData : function(){
		let result = {};
		let inputs = this.$form().getElementsByTagName("input");

		for (let i = 0; i < inputs.length; ++i)
		{
			result[ inputs[i].name ] = inputs[i].value;
		}

		return result;
	},
	setData : function( data ){
		for (let key in data) {
			if( this._inputsNameList.indexOf(key) === -1 ){
				continue;
			}
			let $input = this.$form().querySelector("[name='" + key + "']");
			$input.setAttribute("value", data[key]);
		}
	},
	submit : function(){
		if( !(this.validate().isValid) ){
			return undefined;
		}
		let action = this.$form().action;
		let formData = new FormData(this.$form());
		let $resultContainer = document.getElementById('resultContainer');
		this._requestForm(action, this,  formData, $resultContainer);
	}
}

document.getElementById('submitButton').onclick = function(){
	MyForm.submit();
};

