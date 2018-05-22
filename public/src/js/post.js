uploadFile.addEventListener('change', function (e) {


  let fileReader = new FileReader()
  fileReader.readAsDataURL(e.target.files[0])
  let newName = e.target.files[0].name

  imgContainer.classList.add('is-upgraded','is-dirty')

  fileReader.onload = (e) => {
    imgInput.value = newName
    postImg = e.target.result
  }
})