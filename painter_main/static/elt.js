function elt(name, attributes){
            var node = document.createElement(name);
            if (attributes){
                for (var attr in attributes) {
                    if (attributes.hasOwnProperty(attr)){ // 아마 attr이 프로토타입에 있는거까지 받아와서 그런게 아닐까 싶음 mo
                        node.setAttribute(attr, attributes[attr]);
                    }
                }
            }
            for (var i=2; i<arguments.length; i++) {
                var child = arguments[i];
                if (typeof child == 'string'){
                    child = document.createTextNode(child); // 이 텍스트 노드가 추가되는건 확실하게 파악못했음
                }
                node.appendChild(child);
            }
            return node;
        }