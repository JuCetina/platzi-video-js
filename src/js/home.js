(async function load() {
  
  	async function getData(url) {

    	const response = await fetch(url);
		const data = await response.json();
		if(data.data.movie_count > 0){
			return data;
		}
		else{
			throw new Error('No se ha encontrado ningún resultado');
		}
	}
	
	function itemTemplate(movie, category){
		return(
			`<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
				<div class="primaryPlaylistItem-image">
					<img src="${movie.medium_cover_image}">
				</div>
				<h4 class="primaryPlaylistItem-title">
					${movie.title}
				</h4>
			</div>`
		);
	}

	function createTemplate(HTMLString){
		const html = document.implementation.createHTMLDocument();
		html.body.innerHTML = HTMLString;
		return html.body.children[0];
	}

	function addEventClick($element){
		$element.addEventListener('click', function(){
			showModal($element);
		});
	}

	function renderMovieList(list, $container, category){
		$container.children[0].remove();
		list.forEach((movie) => {
			const movieString = itemTemplate(movie, category);
			const movieElement = createTemplate(movieString);
			$container.append(movieElement);
			const image = movieElement.querySelector('img');
			image.addEventListener('load', function(event){
				event.srcElement.classList.add('fadeIn');
			});
			addEventClick(movieElement);
		});
	}

	function addAttributes($element, attributes){
		for (const key in attributes){
			$element.setAttribute(key, attributes[key]);
		}
	}

	function featuringTemplate(peli){
		return(
			`
			<div class="featuring">
      		  <div class="featuring-image">
      		    <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
      		  </div>
      		  <div class="featuring-content">
      		    <p class="featuring-title">Pelicula encontrada</p>
      		    <p class="featuring-album">${peli.title}</p>
      		  </div>
      		</div>
			`
		);
	}

	function findById(list, id){
		return list.find(movie => movie.id === parseInt(id, 10));
	}
	
	function findMovie(id, category){
		switch(category){
			case 'action': {
				return findById(actionList, id);
			}

			case 'drama': {
				return findById(dramaList, id);
			}

			case 'animation': {
				return findById(animationList, id);
			}
		}
	}

	const $overlay = document.getElementById('overlay');
  	const $modal = document.getElementById('modal');
  	const $hideModal = document.getElementById('hide-modal');

	const $modalTitle = $modal.querySelector('h1');
	const $modalImage = $modal.querySelector('img');
  	const $modalDescription = $modal.querySelector('p');
	
	function showModal($element){
		$overlay.classList.add('active');
		$modal.style.animation = 'modalIn .8s forwards';
		const id = $element.dataset.id;
		const category = $element.dataset.category;
		const dataMovie = findMovie(id, category);

		$modalTitle.textContent = dataMovie.title;
		$modalImage.setAttribute('src', dataMovie.medium_cover_image);
  		$modalDescription.textContent = dataMovie.description_full;
	}

	function hideModal(){
		$overlay.classList.remove('active');
		$modal.style.animation = 'modalOut .8s forwards';
	}
	
	const $form = document.querySelector('#form');
	const $home = document.querySelector('#home');
	const $featuringContainer = document.querySelector('#featuring');

	const BASE_API = 'https://yts.lt/api/v2/'; 
	
	$form.addEventListener('submit', async function(event){
		event.preventDefault();
		$home.classList.add('search-active');

		const $loader = document.createElement('img');
		addAttributes($loader, {
			src: 'src/images/loader.gif',
			height: 50,
			width: 50
		});
		$featuringContainer.append($loader);

		const data = new FormData($form);
		try{
			const {
				data: {
					movies: peli
				}
			} = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);
	
			const HTMLString = featuringTemplate(peli[0]);
			$featuringContainer.innerHTML = HTMLString;
		} catch(error){
			alert(error.message);
			$loader.remove();
			$home.classList.remove('search-active');
		}
	});

	async function cacheExist(category){
		const listName = `${category}List`;
		const cacheList = window.localStorage.getItem(listName);
		if(cacheList){
			return JSON.parse(cacheList);
		}
		const { data: { movies: myData } } = await getData(`${BASE_API}list_movies.json?genre=${category}`);
		window.localStorage.setItem(listName, JSON.stringify(myData));
		return myData;
	}

	const actionList = await cacheExist('action');
	const $actionContainer = document.querySelector('#action');
	renderMovieList(actionList, $actionContainer, 'action');
	
	const dramaList = await cacheExist('drama');
	const $dramaContainer = document.getElementById('drama');
	renderMovieList(dramaList, $dramaContainer, 'drama');

	const animationList = await cacheExist('animation');
	const $animationContainer = document.querySelector('#animation');
	renderMovieList(animationList, $animationContainer, 'animation');

	$hideModal.addEventListener('click', hideModal);
})();




