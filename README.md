# Oxide Rust Plugins Indexer

TypeScript скрипт для индексации всех C# файлов с `namespace Oxide.Plugins` на GitHub с использованием size-based шардирования для обхода лимита 1000 результатов.

## Особенности

- **Size-based шардирование**: Автоматически разбивает поиск по размеру файлов для получения всех ~10,000 результатов
- **Fork режимы**: Обрабатывает как оригинальные репозитории (`fork:false`), так и форки (`fork:only`)
- **Парсинг метаданных**: Извлекает название плагина и автора из `[Info("Name","Author",...)]` или `class Name : RustPlugin`
- **Resume функциональность**: Возобновляет работу с места остановки
- **Continuous режим**: Постоянно мониторит новые плагины
- **Единый вывод**: Все результаты в одном файле `output/oxide_plugins.json`

## Установка

```bash
npm install
```

## Настройка

1. Создайте GitHub Personal Access Token с правами `public_repo`
2. Экспортируйте токен:
   ```bash
   export GITHUB_TOKEN=ghp_your_token_here
   ```

## Запуск

### Одноразовая индексация
```bash
npm start
```

### Непрерывный мониторинг
```bash
CONTINUOUS=true npm start
```

## Архитектура

### Size-based шардирование
Скрипт автоматически разбивает поиск на диапазоны по размеру файлов:
- Диапазоны: 0-64KB, 64-128KB, ..., 384KB (лимит GitHub)
- Для каждого диапазона: `fork:false` и `fork:only`
- Если результат > 1000, диапазон автоматически делится пополам

### Обработка файлов
1. **Поиск**: GitHub Code Search API с size/fork фильтрами
2. **Парсинг**: Извлечение метаданных из содержимого файла
3. **Кэширование**: Репозитории кэшируются для оптимизации
4. **Дедупликация**: Уникальные ключи по `repo#path#sha`

### Состояние
Сохраняется в `output/state.json`:
- Очередь шардов для обработки
- Уже обработанные ключи
- Кэш репозиториев
- Время последнего полного сканирования

## Выходные данные

Файл `output/oxide_plugins.json` содержит:
```json
{
  "generated_at": "2024-01-01T00:00:00.000Z",
  "query": "namespace Oxide.Plugins in:file language:C# extension:cs",
  "count": 10000,
  "items": [
    {
      "plugin_name": "MyPlugin",
      "plugin_author": "AuthorName",
      "language": "C#",
      "file": {
        "path": "MyPlugin.cs",
        "html_url": "https://github.com/...",
        "raw_url": "https://raw.githubusercontent.com/...",
        "sha": "abc123...",
        "size": 1024
      },
      "repository": {
        "full_name": "owner/repo",
        "name": "repo",
        "html_url": "https://github.com/owner/repo",
        "description": "Plugin description",
        "owner_login": "owner",
        "owner_url": "https://github.com/owner",
        "default_branch": "main",
        "stargazers_count": 100,
        "forks_count": 10,
        "open_issues_count": 5,
        "created_at": "2020-01-01T00:00:00Z"
      },
      "indexed_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Переменные окружения

- `GITHUB_TOKEN` (обязательно): GitHub Personal Access Token
- `CONTINUOUS` (по умолчанию: `false`): Непрерывный режим
- `CYCLE_DELAY_MS` (по умолчанию: `900000`): Задержка между циклами (15 мин)
- `SEARCH_QUERY` (по умолчанию: `namespace Oxide.Plugins in:file language:C# extension:cs`): Поисковый запрос

## Ограничения

- GitHub Code Search API имеет лимит 1000 результатов на запрос
- Индексируются только файлы в дефолтной ветке
- Файлы > 384KB не индексируются GitHub
- Rate limits: ~30 запросов/мин для поиска

## Логи

Скрипт выводит подробные логи:
- Прогресс обработки шардов
- Количество найденных элементов
- Ошибки парсинга
- Rate limit предупреждения
- Статистика по завершении

## Восстановление

При прерывании работы скрипт автоматически:
- Сохраняет прогресс в `state.json`
- Возобновляет с последнего обработанного шарда
- Пропускает уже обработанные элементы
- Продолжает с текущей очереди задач


