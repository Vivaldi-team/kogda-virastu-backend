const { join } = require('path');
const swaggerAutogen = require('swagger-autogen');
// путь и название генерируемого файла
const outputFile = join(__dirname, 'swagger.json');
// массив путей к роутерам
const endpointsFiles = [join(__dirname, '../routes/api/index.js')];

const UserData = {
  $username: 'amazinguser',
  $email: 'some@ya.ru',
  $password: 'n0t$r0ngp@ssw0rd',
  $nickname: 'tiredcoder',
  bio: 'Something about me',
  image: 'http://ya.ru/avatar/1.jpg',
};

const doc = {
  info: {
    title: 'Kogda-Virastu API ',
    description: 'API бэкенд-сервиса проекта "КогдаВырасту"',
    version: '1.0.0',
  },
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  definitions: {
    UserData,
    AuthorizedUserData: {
      username: 'amazinguser',
      email: 'some@ya.ru',
      nickname: 'tiredcoder',
      bio: 'Something about me',
      image: 'http://ya.ru/avatar/1.jpg',
      roles: [{ $ref: '#/definitions/UserRoles' }],
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYTdhZDNiMjkwMTMzNjYyYmU5N2JhZiIsInVzZXJuYW1lIjoidXMzM2VyNTQ2NTQ1NDQ1NDMzZXJuMmFtZSIsImV4cCI6MTY2MDM0NDIwMiwiaWF0IjoxNjU1MTYwMjAyfQ.tSqy-nPsXite2N7_qgfHfnFGwRjQvAAnhDso9sKb0xY',
    },
    AuthData: {
      email: 'some@ya.ru',
      password: 'n0t$r0ngp@ssw0rd',
    },
    UserPublicProfile: {
      username: 'amazinguser',
      nickname: 'tiredcoder',
      bio: 'Something about me',
      image: 'http://ya.ru/avatar/1.jpg',
    },
    UserProfile: {
      username: 'amazinguser',
      nickname: 'tiredcoder',
      bio: 'Something about me',
      image: 'http://ya.ru/avatar/1.jpg',
      following: false,
      followingTags: [],
    },
    InviteCode: 'Opgb85A7uRjNp1fmGc53V',
    ArticleData: {
      title: 'Тестовая запись',
      description: 'О чем-то интересном',
      body: 'А это текст статьи 2',
      tagList: [
        'теги',
        'никто',
        'не',
        'читает',
      ],
      link: 'https://static.tildacdn.com/tild3435-3464-4534-b032-633331373365/Main_3.jpg',
    },
    ArticleDataPopulated: {
      _id: '62a82b84eea89a1d74c5cc21',
      title: 'Вторая публикация',
      description: 'Описание публикации',
      body: 'Тело публикации',
      link: 'https://static.tildacdn.com/tild3435-3464-4534-b032-633331373365/Main_3.jpg',
      favoritesCount: 2000,
      comments: [],
      tagList: [
        'публикация',
        'первая_публикация',
      ],
      state: 'published',
      author: {
        $ref: '#/definitions/UserPublicProfile',
      },
      slug: 'vtoraya-publikaciya-biyghs',
      createdAt: '2022-06-14T06:32:36.706Z',
      updatedAt: '2022-06-14T06:32:36.706Z',
    },
    Comment: {
      id: '62a3392219fbd7ec26ff90a4',
      body: 'Тест сообщения',
      createdAt: '2022-06-10T12:29:22.830Z',
      state: { $ref: '#/definitions/PublishState' },
      author: { $ref: '#/definitions/UserProfile' },
    },
    Article: {
      slug: 'testovaya-zapis-szpp6o',
      title: 'Тестовая запись',
      description: 'О чем-то интересном',
      body: 'А это текст статьи 2',
      state: { $ref: '#/definitions/PublishState' },
      createdAt: '2022-06-07T00:20:09.388Z',
      updatedAt: '2022-06-13T12:49:06.305Z',
      tagList: [
        'теги',
        'никто',
        'не',
        'читает',
      ],
      favorited: false,
      favoritesCount: 5,
      author: { $ref: '#/definitions/UserProfile' },
    },
    SignupRequest: {
      user: {
        $ref: '#/definitions/UserProfile',
      },
      invite: { $ref: '#/definitions/InviteCode' },
    },
    InviteNotFoundError: {
      message: 'Invite <invite_code> not found or used',
      method: 'POST',
      url: '/api/v1/users',
      name: 'NotFoundError',
      meta: {},
      errors: {},
    },
    InviteData: {
      _id: '62a7c8055453aa4419c405aa',
      code: 'Opgb85A7uRjNp1fmGc53V',
      used: false,
      createdAt: '2022-06-13T23:28:05.403Z',
    },
    UserRoles: {
      '@enum': [
        'user',
        'admin',
      ],
    },
    PublishState: {
      '@enum': [
        'published',
        'pending',
        'declined',
      ],
    },
  },
  components: {

  },
  host: 'localhost:3000',
  basePath: '/api/v1',
  schemes: ['http'],
};
swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(({ success }) => {
  console.log(`Результат работы генератора: ${success}`);
});
