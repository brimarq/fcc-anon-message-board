const config = {
  boardName: 'test',
  deletePassword: 'pass',
  numThreads: 12,
  maxNumRepliesEach: 6
};

const faker = require('faker/locale/en');

function makeReplyObj(delete_password, threadDate) {
  const text = faker.hacker.phrase();
  const created_on = faker.date.between(threadDate, new Date());
  
  return ({ text, delete_password, created_on });
}

function makeThreadObj(board, delete_password, numReplies) {
  const text = faker.hacker.phrase(); 
  const created_on = faker.date.recent(14);
  const replies = [...Array(numReplies)]
    .map(e => makeReplyObj(delete_password, created_on))
    .sort((a, b) => a.created_on - b.created_on); // asc date sort
  const bumped_on = numReplies ? replies[(numReplies - 1)].created_on : created_on;
  return ({ board, text, replies, delete_password, created_on, bumped_on });
}

function createThreadObjArr(
  boardName = config.boardName, 
  deletePassword = config.deletePassword, 
  numThreads = config.numThreads, 
  maxNumRepliesEach = config.maxNumRepliesEach
  ) {
  const numReplies = faker.random.number(maxNumRepliesEach);
  const threadsArr = [...Array(numThreads)].map(
    e => makeThreadObj(boardName, deletePassword, numReplies)
  );
  
  return threadsArr;
}

module.exports = { createThreadObjArr }