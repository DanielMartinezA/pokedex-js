//Example fetch using pokemonapi.co
// https://thumbs.gfycat.com/AfraidElementaryFlyingfish-size_restricted.gif
let flavorText = []
let pageNumber = 0

document.querySelector('button').addEventListener('click', getFetch)
document.getElementById('page-button').addEventListener('click', changePage)

function getFetch(){
  document.getElementById('pkmnNotFound').innerText = ''
  const poke1 = encodeURIComponent(document.querySelector('#poke1').value.trim().toLowerCase())
  const url = 'https://pokeapi.co/api/v2/pokemon/'+poke1

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        if (data.sprites.versions['generation-ii'].crystal.front_default !== null) {
          /*
          - I get the index - I go to data.game_indices and look in the array for elem.version.name = "crystal"
          and I get elem.game_index - The game index must have three digits i.e 004
          - I get data.name
          - I get the sprite: data.sprites.versions.generation-ii.crystal.front_default
          - I get data.height -- Show as {feet}'{inches}'' i.e 1'08''
          - I get data.weight -- show with only one decimal digit
          */
          let pkmnIndex = data.game_indices.find(
            (elem) => elem.version.name === "crystal"
          ).game_index.toString().padStart(3,'0')
          document.getElementById('pkmnIndex').innerText = `No. ${pkmnIndex}`
          document.getElementById('pkmnName').innerText = data.name
          document.getElementById('noPkmnImage').style.display = 'none'

          // Generate a number in [1, 8192] to choose between default and shiny
          let shinyNum = getRandomInt(1, 8193);
          if (shinyNum === 1) {
            document.getElementById('pkmnImage').src = data.sprites.versions['generation-ii'].crystal.front_shiny
            document.getElementById('pkmnImage').alt = `${data.name} shiny front image`
          } else {
            document.getElementById('pkmnImage').src = data.sprites.versions['generation-ii'].crystal.front_default
            document.getElementById('pkmnImage').alt = `${data.name} front image`
          }

          // Height is given in decimeters, to convert to inches multiply by 3.937
          let inchesHeight = ((data.height*3.937)%12).toFixed(0).padStart(2,'0')
          let feetHeight = Math.trunc(((data.height*3.937)/12))
          if (inchesHeight === "12") {
            feetHeight++
            inchesHeight = "00"
          }
          document.getElementById('pkmnHeight').innerText = `${feetHeight}'${inchesHeight}''`

          // Weight is given in hectograms, to convert to pounds divide by 4.536
          document.getElementById('pkmnWeight').innerText = `${(Math.round(data.weight/4.536)).toFixed(1)} lb`

          fetch(data.species.url)
          .then(res => res.json()) // parse response as JSON
          .then(data => {
            document.getElementById('pkmnGenus').innerText = data.genera.find(
              (elem) => elem.language.name === "en"
            ).genus.replace(' Pokémon','')
            flavorText = data.flavor_text_entries.find(
              (elem) => (elem.language.name === "en") && (elem.version.name === "crystal")
            ).flavor_text.split('\f')
            pageNumber = 0
            document.getElementById('pkmnFlavorText').innerText = flavorText[pageNumber]
            document.getElementById('pkmnFlavorText').classList.remove('text-hidden')
            document.getElementById('pkdexPageNumber').innerText = `P.${pageNumber+1}`
            /*
            - I get the genus (i.e weed): data.genera, this returns an array.
            I look in the array for elem.language.name = "en"
            and the genus is elem.genus with " Pokémon" trimmed out
            - I get the flavor text: data.flavor_text_entries, this returns an array.
            I look in the array for elem.language,name = "en"
            and the flavor text is elem.flavor_text with the "\n" replaced with "<br>"
            Also, if there is an "\f" present, it means the text goes in two pages.
            Therefore I must store it as an array with either one or two elements, or as an object with an attribute
            page1 an another page2
            */
          })
          .catch(err => {
              console.log(`error ${err}`)
          });
        } else { // The pokemon is not from genII
          document.getElementById('pkmnNotFound').innerText = `${document.querySelector('#poke1').value} is not from Gen II`
        }
      })
      .catch(err => {
          console.log(`error ${err}`)
          // The name entered is not a valid pokemon
          document.getElementById('pkmnNotFound').innerText = `${document.querySelector('#poke1').value} is not a valid pokemon`
      });
}

function changePage() {
  if (flavorText.length > 0) {
    pageNumber = (pageNumber + 1) % 2
    document.getElementById('pkmnFlavorText').innerText = flavorText[pageNumber]
    document.getElementById('pkdexPageNumber').innerText = `P.${pageNumber+1}`
  }
}

/*
Returns a random integer between the specified values.
The value is no lower than min (or the next integer greater than min if min isn't an integer),
and is less than (but not equal to) max. 
*/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
