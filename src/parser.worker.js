import yaml from "js-yaml";

/*
 * Parsing YAML takes time. We do not want to block the main rendering thread.
 * That's why we do the YAML parsing in a separate worker thread.
 */

self.onmessage = function(message) {
    if (message.data.command === "parse") {
        try {
            const jsonContent = yaml.load(message.data.dataContractYaml);

            postMessage({status: "success", json: jsonContent});
        } catch (e) {
            postMessage({status: "error", error: e});
        }
    }
};
