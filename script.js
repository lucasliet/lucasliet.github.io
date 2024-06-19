getOrFetch('https://api.github.com/users/lucasliet', renderUserPhoto);
getOrFetch('https://api.github.com/users/lucasliet/repos?sort=updated&per_page=100', renderRepositories);

function getOrFetch(url, renderFunction) {
  const cachedData = JSON.parse(sessionStorage.getItem(url));

  if (cachedData) {
    renderFunction(cachedData);
  } else {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          throw new Error(Object.values(data));
        }
        sessionStorage.setItem(url, JSON.stringify(data));
        renderFunction(data);
      })
      .catch(error => {
        const header = document.querySelector('main');
        const errorMessage = document.createElement('p');
        const errorMessageStyle = {
          backgroundColor: 'red',
          color: 'white',
          fontWeight: 'bold',
          padding: '1rem',
          borderRadius: '5px',
          fontSize: '3rem',
        };
        Object.assign(errorMessage.style, errorMessageStyle);
        errorMessage.textContent = `An error occurred while fetching data from GitHub API | ${error}`;
        header.appendChild(errorMessage);
        console.error('Error:', error);
      });
  }
}

function renderUserPhoto(user) {
  const header = document.querySelector('header');

  const title = document.createElement('h1');
  title.textContent = `${user.name}'s Repositories`;
  header.appendChild(title);

  const githubUrl = document.createElement('a');
  githubUrl.href = user.html_url;
  const userPhoto = document.createElement('img');
  userPhoto.className = 'userphoto';
  userPhoto.src = user.avatar_url;
  userPhoto.alt = user.login;
  userPhoto.href = user.html_url;
  githubUrl.appendChild(userPhoto);
  header.appendChild(githubUrl);

}

function renderRepositories(repositories) {
  const repositoriesContainer = document.querySelector('main')
  repositories.forEach(repository => {
      const repositoryElement = document.createElement('div');
      repositoryElement.className = 'repository';

      const titleAndLanguage = document.createElement('div');
      titleAndLanguage.className = 'title';
      const repositoryName = document.createElement('a');
      repositoryName.href = repository.html_url;
      repositoryName.textContent = repository.name;
      titleAndLanguage.appendChild(repositoryName);

      const langageBadge = document.createElement('span');
      langageBadge.textContent = repository.language;
      titleAndLanguage.appendChild(langageBadge);

      repositoryElement.appendChild(titleAndLanguage);

      const repositoryDescription = document.createElement('p');
      repositoryDescription.textContent = repository.description;
      repositoryElement.appendChild(repositoryDescription);

      if (repository.homepage) {
        const repositoryLink = document.createElement('button');
        repositoryLink.textContent = 'Go to Homepage';
        repositoryLink.addEventListener('click', () => {
          window.location.href = repository.homepage;
        });
        repositoryElement.appendChild(repositoryLink);
      }

      repositoriesContainer.appendChild(repositoryElement);
    });
}