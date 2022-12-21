function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

const mapToObject = (map = new Map) => {
  return Array.from(map.entries(),([ k, v ]) => {
    return v instanceof Map
    ? { key: k, value: mapToObject (v) }
    : { key: k, value: v }
  }) 
}

//this function use for sorting logic in merge sort (sq raport)
function sortingConditionForSQRaport(left, right){
  if(left.nilai.total > right.nilai.total){
    return true
  }
  return false
}

function mergeArr({left, right, func}) {  
  left = (left||[])
  right = (right||[])
  func = (func||function(left, right){return true})
  let sortedArr = []
  while (left.length && right.length) {    
    if (func(left[0], right[0])) {
      sortedArr.push(left.shift())
    } else {
      sortedArr.push(right.shift())
    }
  }  
  return [...sortedArr, ...left, ...right]
}

function mergeSort({arr, func}) {  
  arr = (arr||[])
  func = (func||function(left, right){return true})
  if (arr.length <= 1) return arr
  let mid = Math.floor(arr.length / 2)  
  let left = mergeSort({arr:arr.slice(0, mid), func:func})
  let right = mergeSort({arr:arr.slice(mid), func:func})
  return mergeArr({left:left, right:right, func:func})
}
  

module.exports = {replaceAll, mapToObject, mergeArr, mergeSort, sortingConditionForSQRaport}
