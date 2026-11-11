# Library Microservices System
# Système de gestion de bibliothèque — Architecture Microservices

## 1. Présentation du projet

### 1.1. Problématique : concevoir un système distribué de gestion de bibliothèque

À première vue, un système de gestion de bibliothèque peut sembler relativement simple : les utilisateurs doivent pouvoir consulter un catalogue, rechercher des livres, emprunter des ouvrages et les retourner.

Cependant, derrière ces opérations apparemment élémentaires se trouvent plusieurs responsabilités indépendantes :

- Gérer les utilisateurs et leurs profils.
- Administrer le catalogue des livres et suivre leur disponibilité.
- Gérer les opérations d'emprunt et de retour.
- Appliquer les règles métier et garantir la cohérence des données.
- Informer les composants concernés lorsqu'une opération importante est effectuée.

À mesure que le système évolue, regrouper toutes ces responsabilités dans une seule application peut rendre le code plus difficile à maintenir, à faire évoluer et à dimensionner.

Ce projet explore comment répartir ces responsabilités entre plusieurs services indépendants, chacun étant chargé d'un domaine métier bien défini.

L'objectif n'est pas simplement de diviser une application en plusieurs petits composants. Il s'agit de comprendre comment ces services peuvent communiquer efficacement, exposer une interface unifiée aux clients et collaborer pour réaliser des opérations métier complètes.

Cette réflexion nous conduit à adopter une architecture microservices, reposant sur plusieurs technologies de communication, chacune répondant à un besoin architectural spécifique.

---

## 2. Du client à la communication entre services

Avant de présenter les microservices eux-mêmes, une première question fondamentale se pose :

**Comment permettre à un client d'interagir avec plusieurs services indépendants sans qu'il ait besoin de connaître toute l'organisation interne du backend ?**

Prenons un exemple simple : un utilisateur souhaite consulter les informations d'un livre, notamment son titre, son auteur et sa disponibilité.

Ces différentes informations peuvent nécessiter plusieurs opérations backend et impliquer différents services.

Une première approche consisterait à exposer directement chaque service au client. Celui-ci devrait alors connaître les services à contacter, les points d'accès à utiliser et la manière de combiner les informations retournées.

Cette approche présente plusieurs inconvénients :

- Le client devient fortement dépendant de l'organisation interne du backend.
- Une seule opération métier peut nécessiter plusieurs requêtes réseau.
- Le client doit prendre en charge la logique d'agrégation des données.
- Toute modification de l'organisation des services risque d'affecter l'application cliente.

Il devient donc nécessaire d'introduire une couche intermédiaire entre les clients et les microservices.

C'est dans ce contexte qu'intervient l'**API Gateway**.

### 2.1. API Gateway : un point d'entrée unique

L'API Gateway constitue le point d'entrée unique à travers lequel les clients externes accèdent au backend.

Au lieu de communiquer directement avec les différents microservices, le client adresse ses requêtes à cette passerelle.

Celle-ci se charge de diriger les requêtes vers les services appropriés et, lorsque cela est nécessaire, de coordonner leurs interactions.

Sur le plan architectural, une API Gateway peut également jouer le rôle de **Reverse Proxy** :

- Elle reçoit les requêtes entrantes des clients.
- Elle identifie leur destination.
- Elle transmet les requêtes aux services backend concernés.
- Elle retourne les réponses correspondantes au client.

Au-delà du routage, une API Gateway peut centraliser d'autres responsabilités, telles que l'authentification, la validation des requêtes, la limitation du nombre de requêtes (Rate Limiting) et la journalisation (Logging), selon son implémentation.

Dans ce projet, la passerelle joue également un rôle important en exposant différentes modalités d'interaction avec le backend à travers REST et GraphQL.

### 2.2. Pourquoi GraphQL ? Résoudre le problème d'agrégation des données

L'introduction d'une API Gateway permet de disposer d'un point d'entrée unique, mais elle ne résout pas nécessairement le problème de récupération de données provenant de plusieurs services.

Considérons le scénario suivant :

Un client souhaite récupérer les informations d'un livre ainsi que celles de son auteur.

Avec une approche REST traditionnelle, le client pourrait être amené à effectuer plusieurs requêtes :

1. Récupérer les informations du livre auprès du Book Service.
2. Récupérer les informations complémentaires auprès du service concerné.
3. Combiner les différentes réponses du côté client.

Cette approche peut multiplier les échanges réseau et transférer au frontend une partie de la responsabilité de l'agrégation des données.

GraphQL propose une autre approche.

Il permet au client de décrire précisément les données dont il a besoin à travers une seule requête. Le serveur GraphQL exécute ensuite les *resolvers* correspondants afin de récupérer les informations demandées auprès des différentes sources de données.

Prenons l'exemple de la requête GraphQL suivante :

```graphql
query {
  book(id: "book-123") {
    title
    author {
      name
    }
    availability
  }
}
```

Son exécution suit le déroulement suivant :

1. Le client envoie une requête GraphQL à l'API Gateway.
2. Le moteur GraphQL interprète les champs demandés.
3. Les resolvers associés sont exécutés.
4. Chaque resolver récupère les informations nécessaires, éventuellement en communiquant avec différents microservices.
5. GraphQL rassemble les valeurs obtenues dans une réponse unique.
6. La passerelle retourne le résultat au client.

La réponse attendue pourrait avoir la structure suivante :

```json
{
  "data": {
    "book": {
      "title": "Clean Code",
      "author": {
        "name": "Robert C. Martin"
      },
      "availability": true
    }
  }
}
```

L'idée fondamentale est la suivante : **le client décrit les informations dont il a besoin, tandis que le backend prend en charge la manière de les récupérer.**

Cette approche permet de séparer le modèle de données exposé au client de l'organisation interne des microservices.

GraphQL joue ainsi le rôle d'une couche d'agrégation des données, tandis que les resolvers implémentent la logique nécessaire à leur récupération.

Il est important de préciser que GraphQL n'impose pas de mécanisme particulier pour communiquer avec les microservices. Ce choix dépend de l'implémentation des resolvers. Dans notre projet, gRPC est utilisé pour assurer cette communication interne.

---

## 3. Choisir un protocole de communication entre microservices

Maintenant que l'API Gateway fournit un point d'entrée unifié, une autre question architecturale se pose :

**Comment les différents microservices, qui constituent des applications indépendantes, doivent-ils communiquer entre eux ?**

Une architecture microservices introduit des communications réseau entre des composants qui, dans une application monolithique, auraient éventuellement interagi à travers de simples appels de fonctions.

Par conséquent, l'efficacité des échanges, la sérialisation des données, la définition des contrats de communication et les coûts liés aux échanges réseau deviennent des éléments importants à prendre en considération.

HTTP/1.1 est largement utilisé pour les communications client-serveur, notamment à travers les API REST. Cependant, HTTP/2 apporte plusieurs améliorations qui le rendent particulièrement intéressant pour les systèmes distribués.

### 3.1. HTTP/1.1 vs HTTP/2 : comprendre l'évolution

HTTP/2 a été introduit afin d'améliorer l'efficacité des échanges HTTP sans modifier les principes fondamentaux du modèle requête-réponse.

Ses principales améliorations sont les suivantes :

**1. Le format binaire (Binary Framing)**

Contrairement à HTTP/1.1, qui utilise une représentation textuelle pour ses messages de protocole, HTTP/2 repose sur des trames binaires.

Cette organisation permet de structurer et de traiter les échanges de manière plus efficace.

Il faut toutefois distinguer le format binaire des trames HTTP/2 de la sérialisation des données applicatives : HTTP/2 ne transforme pas automatiquement les données JSON en un format plus compact.

**2. Le multiplexage (Multiplexing)**

HTTP/1.1 traite traditionnellement les requêtes de manière séquentielle sur une connexion persistante, sauf recours à d'autres mécanismes comme le pipelining ou l'utilisation de plusieurs connexions.

HTTP/2 introduit le multiplexage, qui permet à plusieurs flux indépendants d'échanger simultanément des données sur une même connexion.

Cela réduit le besoin d'établir plusieurs connexions et améliore l'utilisation des ressources réseau.

**3. La compression des en-têtes (Header Compression)**

HTTP/2 introduit HPACK, un mécanisme de compression qui réduit la surcharge liée à la transmission répétée des en-têtes HTTP.

Grâce à ces améliorations, HTTP/2 offre une communication plus efficace, notamment dans les applications impliquant des échanges fréquents entre composants distribués.

### 3.2. Pourquoi gRPC ?

HTTP/2 fournit un protocole de transport efficace, mais ne définit pas à lui seul la manière dont les microservices doivent exposer leurs opérations ni structurer leurs messages applicatifs.

Nous avons donc besoin d'un framework de communication qui apporte :

- Un contrat de communication clairement défini entre les services.
- Un mécanisme standardisé d'invocation d'opérations distantes.
- Une sérialisation efficace des messages.
- La prise en charge de différents modèles de communication, notamment le streaming.

gRPC répond à ces besoins.

gRPC est un framework de communication de type RPC (*Remote Procedure Call*) qui permet à un service d'invoquer les méthodes exposées par un autre service comme s'il s'agissait d'appels de procédures locales, alors que leur exécution se déroule réellement à travers le réseau.

Il repose sur deux technologies importantes :

**Protocol Buffers (Protobuf)**

Protocol Buffers fournit un mécanisme indépendant du langage de programmation pour définir les contrats de communication et les structures des messages à travers des fichiers `.proto`.

Au lieu d'échanger des objets JSON relativement verbeux, gRPC utilise Protocol Buffers pour sérialiser les messages dans une représentation binaire compacte.

Cela peut réduire la taille des données échangées et les coûts de sérialisation, même si les performances réelles dépendent de la charge de travail et de la structure des messages.

**HTTP/2**

gRPC utilise HTTP/2 comme protocole de transport sous-jacent.

Cela lui permet de bénéficier du multiplexage et de prendre en charge différents modèles de communication.

On distingue quatre principaux types d'appels gRPC :

- **Unary RPC :** une requête suivie d'une seule réponse.
- **Server Streaming :** une requête suivie de plusieurs réponses.
- **Client Streaming :** plusieurs requêtes suivies d'une seule réponse.
- **Bidirectional Streaming :** les deux services peuvent échanger plusieurs messages indépendamment l'un de l'autre.

Ce dernier modèle est particulièrement intéressant, car il permet aux deux parties d'envoyer des messages sans attendre que l'autre ait terminé l'intégralité de son flux.

Il faut cependant préciser que tous les appels gRPC ne nécessitent pas de communication bidirectionnelle. Le modèle classique requête-réponse est également pris en charge.

Dans ce projet, gRPC est utilisé comme mécanisme de communication interne entre l'API Gateway et les microservices.

---

## 4. Faire le lien entre la communication client et la communication interne

Nous disposons désormais de deux besoins de communication distincts :

- Les clients externes ont besoin d'une API accessible, exposée à travers REST et GraphQL.
- Les microservices ont besoin d'un mécanisme de communication interne efficace, basé sur gRPC et HTTP/2.

Ces deux couches de communication ne sont pas obligées d'utiliser le même protocole.

Par exemple, un client web peut communiquer avec l'API Gateway en HTTP/1.1, tandis que cette dernière communique avec les microservices backend à travers gRPC sur HTTP/2.

Il ne s'agit pas d'une incompatibilité entre les protocoles qui obligerait à abandonner HTTP/2 d'un côté. Il s'agit d'une frontière entre deux couches de communication, que l'API Gateway permet de gérer.

L'API Gateway joue ainsi le rôle d'intermédiaire entre ces deux modèles :

1. Elle reçoit une requête HTTP provenant du client.
2. Elle traite le point d'accès REST ou l'opération GraphQL.
3. Elle invoque les méthodes gRPC internes appropriées.
4. Elle reçoit les réponses provenant des microservices.
5. Elle transforme ou agrège les résultats lorsque cela est nécessaire.
6. Elle renvoie la réponse finale au client.

Cette séparation permet à chaque couche de communication d'utiliser le protocole le mieux adapté à ses responsabilités.

**L'API Gateway remplit donc deux fonctions architecturales essentielles :**

- Masquer la complexité du backend distribué aux clients externes.
- Assurer la liaison entre la couche API exposée aux clients et la couche de communication interne basée sur gRPC.

### 4.1. Une alternative : HTTP/1.1 avec WebSocket

HTTP/2 n'est pas le seul moyen d'obtenir une communication bidirectionnelle.

WebSocket constitue une autre solution permettant d'établir un canal de communication persistant et bidirectionnel entre un client et un serveur.

La connexion commence par une négociation HTTP. Après une mise à niveau réussie du protocole (*Protocol Upgrade*), les deux parties peuvent échanger des messages indépendamment l'une de l'autre.

Cette approche est particulièrement utile pour les applications nécessitant une communication persistante en temps réel, comme les applications de messagerie instantanée, les tableaux de bord en direct ou les outils collaboratifs.

Cependant, WebSocket et gRPC répondent à des besoins quelque peu différents :

- WebSocket fournit un canal de communication bidirectionnel généraliste.
- gRPC fournit un framework RPC structuré, reposant sur des contrats de services, Protocol Buffers et plusieurs modèles de communication, dont le streaming bidirectionnel.

Pour ce projet, gRPC a été retenu parce qu'il offre une manière structurée de définir et d'invoquer les opérations entre services indépendants, tout en tirant parti de HTTP/2.

---

## 5. Architecture de communication résultante

Les réflexions précédentes nous conduisent à l'architecture de communication suivante :

```text
                  CLIENT
                     |
                     | HTTP/1.1
                     | REST / GraphQL
                     v
              +---------------+
              |  API GATEWAY  |
              |               |
              | Express       |
              | Apollo Server |
              | GraphQL       |
              | Resolvers     |
              +---------------+
                     |
                     | gRPC over HTTP/2
                     | Protobuf
                     |
           +---------+---------+
           |         |         |
           v         v         v
       +--------+ +--------+ +---------+
       |  USER  | |  BOOK  | | BORROW  |
       | SERVICE| | SERVICE| | SERVICE |
       +--------+ +--------+ +---------+
           |         |         |
           v         v         v
         SQLite    SQLite     RxDB
```

Cette architecture établit une séparation claire entre l'accès externe à l'API et la communication interne entre les services.

L'API Gateway fournit une interface unifiée, GraphQL permet une récupération et une agrégation flexibles des données, tandis que gRPC assure une communication structurée entre les services distribués.

La prochaine étape consiste à examiner la répartition des responsabilités entre les différents microservices et la manière dont la propriété des données est organisée.

---




## Authors
Nairouz Bakhta Ben Hadj Slama


