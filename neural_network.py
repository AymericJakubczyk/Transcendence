import numpy as np

class Brain:
    def __init__(self, input_size, output_size):
        """
        Initialise un réseau de neurones avec des poids aléatoires et des biais à 0.
        input_size : nombre d'entrées (par ex. l'état du jeu)
        output_size : nombre de sorties (par ex. UP, DOWN, STAY)
        """
        self.weights = np.random.randn(input_size, output_size) * 0.01
        self.biases = np.zeros((1, output_size))

    def think(self, inputs):
        """
        Effectue une passe avant (prédiction) :
        inputs : état du jeu (tableau numpy)
        Retourne les scores des actions possibles.
        """
        return np.dot(inputs, self.weights) + self.biases


    def train(self, inputs, targets, learning_rate=0.01):
        outputs = self.think(inputs)  # Prédiction
        error = targets - outputs  # Erreur entre la prédiction et la cible

        # Vérification des données
        if np.any(np.isnan(inputs)) or np.any(np.isnan(error)):
            print("Erreur : NaN détecté dans les données")
            print("Inputs :", inputs)
            print("Targets :", targets)
            print("Outputs :", outputs)
            return

        # Mise à jour des poids et biais
        self.weights += learning_rate * np.dot(inputs.T, error)
        self.biases += learning_rate * np.sum(error, axis=0, keepdims=True)
