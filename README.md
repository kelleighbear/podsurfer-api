# podsurfer
Public API for Baylor PodSurfer project

# generate API docs
`apidoc -i server/ -o apidoc/`

# deploying via Codeship and Heroku
On Heroku, create a new personal app and name it. Under the Resources tab, and the mLab MongoDB add-on.

On Codeship, create a new project. On the Test page, add these setup commands:
`nvm install 5.0`
`nvm use 5.0`
`npm install`
Under test commands, add `gulp test`.
Go to the Deployment page. Add a Heroku deployment. Add your Heroku app information (Application name, Heroku API Key, and URL). Set Check app URL to YES.
Make a commit to your project and see if it worked!
