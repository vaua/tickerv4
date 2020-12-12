function numbersToNumber(numbers, sizeInBytes) {
    var result = 0;
    for (var i = 0; i < numbers.length; i++) {
        result += numbers[i] * Math.pow(2, i * sizeInBytes);
    }

    console.log("Type: " + typeof(result));
    return result;
}



console.log("Result: "  + numbersToNumber(test, 3));