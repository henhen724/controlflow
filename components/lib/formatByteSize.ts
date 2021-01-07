export const formatByteSize = (bytes: number) => {
    var unit = "B";
    var number = bytes;
    if (bytes > 1099511627776) {
        unit = "TB";
        number = bytes / 1099511627776.0;
    } else if (bytes > 1073741824) {
        unit = "GB";
        number = bytes / 1073741824.0;
    } else if (bytes > 1048576) {
        unit = "MB";
        number = bytes / 1048576.0;
    } else if (bytes > 1024) {
        unit = "KB";
        number = bytes / 1024.0;
    }
    return `${number.toFixed(1)} ${unit}`
}