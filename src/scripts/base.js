// UTIL
export class Util {
    static getCenter(el) {
        let bbox = el.getBoundingClientRect();
    
        return {
            x: bbox.left + (bbox.width/2),
            y: bbox.top + (bbox.height/2)
        };
    }
    
    static getRadius(el) {
        let bbox = el.getBoundingClientRect();
        return bbox.width/2;
    }

    static getOffset(el1, el2) {
        return {
            x: (el2.x - el1.x),
            y: (el2.y - el1.y)
        };
    }
};
