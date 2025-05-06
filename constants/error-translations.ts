export const errorTranslations: Record<string, string> = {
    // Общие ошибки аутентификации / авторизации
    "Unable to log in with provided credentials.": "Не удалось войти с указанными учетными данными",
    "Invalid token.": "Недопустимый токен",
    "Invalid credentials.": "Недействительные учетные данные",
    "User account is disabled.": "Учетная запись пользователя отключена",
  
    // Ошибки регистрации
    "User with this email already exists.": "Пользователь с этим email уже существует",
    "A user is already registered with this e-mail address.": "Пользователь с этим email уже зарегистрирован",
  
    // Ошибки валидации полей (универсальные)
    "This field is required.": "Это поле обязательно",
    "This field may not be blank.": "Это поле не может быть пустым",
    "This field may not be null.": "Это поле не может быть null",
    "Enter a valid email address.": "Введите корректный email адрес",
    "Ensure this field has at least 1 character.": "Убедитесь, что поле содержит хотя бы 1 символ",
    "Ensure this field has no more than 150 characters.": "Убедитесь, что поле содержит не более 150 символов",
    "Ensure this value is greater than or equal to 0.": "Убедитесь, что значение больше или равно 0",
    "Ensure this value is less than or equal to 100.": "Убедитесь, что значение меньше или равно 100",
  
    // Общие ошибки сериализации и объектов
    "Invalid data. Expected a dictionary, but got list.": "Неверные данные. Ожидался объект, а получен список",
    "Invalid data. Expected a list, but got dict.": "Неверные данные. Ожидался список, а получен объект",
  
    // Ошибки доступа
    "You do not have permission to perform this action.": "У вас нет прав для выполнения этого действия",
    "Authentication credentials were not provided.": "Учетные данные не были предоставлены",
    "Network error.": "Ошибка сети, проверьте подключение к интернету",
  
    // Ошибки запросов
    "Not found.": "Не найдено.",
    "Method \"GET\" not allowed.": "Метод \"GET\" не разрешён",
    "Method \"POST\" not allowed.": "Метод \"POST\" не разрешён",
    "A server error occurred.": "Произошла ошибка сервера",
  };
  