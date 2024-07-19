import { getExample } from "../templates/examples.js";
import {decodeQueryParameter} from "../sharing/encoding.js";


function loadDataContractYaml() {
	return localStorage.getItem("dataContractYaml");
}

function isFirstLoadOfDataContractEditor() {
	return localStorage.getItem("dataContractYamlUpdated") === null;
}

export function storeDataContractYaml(yaml) {
		localStorage.setItem("dataContractYaml", yaml);
		localStorage.setItem("dataContractYamlUpdated", new Date().toISOString());
}

export function loadInitialDocument() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has("dc")) {
        decodeQueryParameter(urlParams.get("dc")).then(value => {
					storeDataContractYaml(value);
					window.location.search = "";
				});
    }
    if (isFirstLoadOfDataContractEditor()) {
        storeDataContractYaml(getExample());
    }
    return loadDataContractYaml();
}
