export const DateToString = (dt) => {
    // console.log("dt", dt);
    try {
        let d = new Date(dt);
        let y = d.getFullYear();
        let m = d.getMonth() + 1;
        if (m < 10) {
            m = "0" + m;
        }
        let d1 = d.getDate();
        if (d1 < 10) {
            d1 = "0" + d1;
        }
        return y + "-" + m + "-" + d1;
    }
    catch (e) {
        return "";
    }
}

export const DateToLongString = (dt) => {
    try {
        let d = new Date(dt);
        let y = d.getFullYear();
        let m = d.getMonth() + 1;
        if (m < 10) {
            m = "0" + m;
        }
        let d1 = d.getDate();
        if (d1 < 10) {
            d1 = "0" + d1;
        }
        return y + "-" + m + "-" + d1 + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    }
    catch (e) {
        return "";
    }
}


export const getTime = () => {
    return (new Date()).getTime();
}