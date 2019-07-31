const crypto = require('crypto');
const { execSync } = require('child_process')

function createComparisonSignature (body) {
  const hmac = crypto.createHmac('sha1', process.env.SECRET);
  const self_signature = hmac.update(JSON.stringify(body)).digest('hex');
  return `sha1=${self_signature}`; // shape in GitHub header
}

function compareSignatures (signature, comparison_signature) {
  let source, comparison;
  if (signature.length !== comparison_signature.length) { return false }
  source = Buffer.from(signature);
  comparison = Buffer.from(comparison_signature);
  return crypto.timingSafeEqual(source, comparison); // constant time comparison
}

function verifyGithubPayload (req, res, next) {
  const { headers, body } = req;
  const signature = headers['x-hub-signature'] || '';
  const comparison_signature = createComparisonSignature(body);
  const isVerifiedSignature = compareSignatures(signature, comparison_signature);

  if (!isVerifiedSignature) {
    return res.status(401).send('Mismatched signatures');
  }

  next();
};


function eventHandler (req, res) {
  const pullBranch = process.env.PULL_BRANCH || 'master';
  const eventType = req.headers['x-github-event'];
  let repoRef, repoGitUrl, pushedBranch, gitPull;
  
  if (eventType !== 'push') {
    return res.status(202).send(`Acknowledged ${eventType} event from GitHub.`);
  }

  repoRef = req.body.ref;
  repoGitUrl = req.body.repository.git_url;
  pushedBranch = repoRef.split('/').pop();
  gitPull = `git checkout -- ./ && git pull -X theirs ${repoGitUrl} ${pullBranch} && refresh`;

  if (repoRef === `refs/heads/${pullBranch}`) {
    console.log('Fetching updates...');
    console.log(execSync(gitPull).toString());
    return res.status(200).send(`Repo ${pushedBranch} branch successfully deployed to Glitch.`);
  } 
  
  res.status(202).send(`No deployment for this event. Push was to ${pushedBranch} branch, but Glitch is set to pull ${pullBranch}.`)
  
};

module.exports = function (app) {
  app.post('/glitch-deploy', verifyGithubPayload, eventHandler);
};