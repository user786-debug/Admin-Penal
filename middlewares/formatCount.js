const formatCount = (num) => {
    if (num >= 1e6) return Math.floor(num / 1e5) / 10 + 'M';
    if (num >= 1e3) return Math.floor(num / 100) / 10 + 'k';
    return num.toString();
};

module.exports = formatCount;
