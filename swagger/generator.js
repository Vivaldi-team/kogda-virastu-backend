const { join } = require('path');
const swaggerAutogen = require('swagger-autogen');
// путь и название генерируемого файла
const outputFile = join(__dirname, 'swagger.json');
// массив путей к роутерам
const endpointsFiles = [join(__dirname, '../routes/api/index.js')];

const doc = {
  // общая информация
  info: {
    title: 'Kogda-Virastu API ',
    description: 'API бэкенд-сервиса проекта "КогдаВырасту"',
  },
  // что-то типа моделей
  definitions: {
    // модель задачи
    Todo: {
      id: '1',
      text: 'test',
      done: false,
    },
    // модель массива задач
    Todos: [
      {
        // ссылка на модель задачи
        $ref: '#/definitions/Todo',
      },
    ],
    // модель объекта с текстом новой задачи
    Text: {
      text: 'test',
    },
    // модель объекта с изменениями существующей задачи
    Changes: {
      changes: {
        text: 'test',
        done: true,
      },
    },
  },
  host: 'api.kogda-virastu.com',
  schemes: ['https'],
};
swaggerAutogen()(outputFile, endpointsFiles, doc).then(({ success }) => {
  console.log(`Результат работы генератора: ${success}`);
});
