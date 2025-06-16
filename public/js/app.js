document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const recipesContainer = document.getElementById("recipes-container");
  const loadingMessage = document.getElementById("loading-message");
  const noResultsMessage = document.getElementById("no-results-message");

  const mealDetailsModal = document.getElementById("meal-details-modal");
  const closeModalButton = document.getElementById("close-modal-button");
  const modalCloseButtonBottom = document.getElementById(
    "modal-close-button-bottom"
  );
  const modalMealImage = document.getElementById("modal-meal-image");
  const modalMealName = document.getElementById("modal-meal-name");
  const modalMealInstructions = document.getElementById(
    "modal-meal-instructions"
  );
  const modalMealIngredients = document.getElementById(
    "modal-meal-ingredients"
  );

  // Function to display/hide messages
  function displayMessage(element, show) {
    console.log(`displayMessage called for ${element.id}: show = ${show}`);
    if (show) {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
  }

  // Function to show the modal (rest of the code is unchanged)
  function showModal() {
    mealDetailsModal.classList.remove("hidden");
    mealDetailsModal.classList.add("flex");

    setTimeout(() => {
      mealDetailsModal
        .querySelector("div")
        .classList.remove("scale-95", "opacity-0");
      mealDetailsModal
        .querySelector("div")
        .classList.add("scale-100", "opacity-100");
    }, 10);
  }

  // Function to hide the modal (rest of the code is unchanged)
  function hideModal() {
    mealDetailsModal
      .querySelector("div")
      .classList.remove("scale-100", "opacity-100");
    mealDetailsModal
      .querySelector("div")
      .classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      mealDetailsModal.classList.add("hidden");
      mealDetailsModal.classList.remove("flex");
    }, 300);
  }

  // Event listener for closing the modal (rest of the code is unchanged)
  closeModalButton.addEventListener("click", hideModal);
  modalCloseButtonBottom.addEventListener("click", hideModal);
  mealDetailsModal.addEventListener("click", (event) => {
    if (event.target === mealDetailsModal) {
      hideModal();
    }
  });

  // Function to fetch and display meal details in modal (rest of the code is unchanged)
  async function fetchAndDisplayMealDetails(mealId) {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
      );
      const data = await response.json();
      const meal = data.meals[0];

      if (meal) {
        modalMealImage.src =
          meal.strMealThumb ||
          "https://placehold.co/600x400/E0E0E0/333333?text=No+Image";
        modalMealImage.alt = meal.strMeal;
        modalMealName.textContent = meal.strMeal;
        modalMealInstructions.textContent =
          meal.strInstructions || "No instructions available.";

        modalMealIngredients.innerHTML = "";
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];

          if (
            ingredient &&
            ingredient.trim() !== "" &&
            measure &&
            measure.trim() !== ""
          ) {
            const listItem = document.createElement("li");
            listItem.textContent = `${measure.trim()} ${ingredient.trim()}`;
            modalMealIngredients.appendChild(listItem);
          }
        }
        showModal();
      } else {
        console.warn(`No meal found with ID: ${mealId}`);
      }
    } catch (error) {
      console.error("Error fetching meal details:", error);
    }
  }

  // Function to fetch and display meals in the main grid
  async function fetchAndDisplayMeals(searchTerm = "") {
    recipesContainer.innerHTML = "";
    displayMessage(loadingMessage, true);
    displayMessage(noResultsMessage, false); // Hides it at the start of search
    searchButton.disabled = true;

    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
      );
      const data = await response.json();

      console.log("API Response Data:", data); // Log the full API response
      console.log("data.meals:", data.meals); // Log the data.meals property

      displayMessage(loadingMessage, false);

      if (data.meals && data.meals.length > 0) {
        console.log("Meals found, displaying cards.");
        const mealsToDisplay = data.meals.slice(0, 50);
        mealsToDisplay.forEach((meal) => {
          const mealCard = `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 duration-300">
              <img src="${
                meal.strMealThumb
              }/preview" onerror="this.onerror=null;this.src='https://placehold.co/600x400/E0E0E0/333333?text=No+Image';" alt="${
            meal.strMeal
          }" class="w-full h-48 object-cover">
              <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${
                  meal.strMeal
                }</h3>
                <p class="text-gray-600 text-sm mb-4">${
                  meal.strInstructions
                    ? meal.strInstructions.substring(0, 100) + "..."
                    : "No instructions available."
                }</p>
                <button class="view-details-button w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition duration-300 ease-in-out" data-meal-id="${
                  meal.idMeal
                }">View Details</button>
              </div>
            </div>
          `;
          recipesContainer.insertAdjacentHTML("beforeend", mealCard);
        });

        document.querySelectorAll(".view-details-button").forEach((button) => {
          button.addEventListener("click", (event) => {
            const mealId = event.target.dataset.mealId;
            if (mealId) {
              fetchAndDisplayMealDetails(mealId);
            }
          });
        });
      } else {
        console.log("No meals found, displaying no-results message.");
        displayMessage(noResultsMessage, true);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      displayMessage(loadingMessage, false);
      recipesContainer.innerHTML = `<p class="col-span-full text-center text-red-500">Failed to load recipes. Please try again later.</p>`;
    } finally {
      searchButton.disabled = false;
    }
  }

  // Event listener for search button click
  searchButton.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim();
    fetchAndDisplayMeals(searchTerm);
  });

  // Event listener for Enter key in search input
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const searchTerm = searchInput.value.trim();
      fetchAndDisplayMeals(searchTerm);
    }
  });

  // Initial load of some popular recipes (e.g., 'chicken')
  fetchAndDisplayMeals("chicken");
});
