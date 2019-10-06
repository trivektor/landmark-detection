require 'sinatra'
require 'sinatra/reloader' if development?
require 'google/cloud/vision'
require 'awesome_print'
require 'json'
require 'jwt'
require 'openssl'
require 'date'

before do
  headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
  headers['Access-Control-Allow-Origin'] = '*'
  headers['Access-Control-Allow-Headers'] = 'accept, authorization, origin, content-type'
end

options '*' do
  response.headers['Allow'] = 'HEAD,GET,PUT,DELETE,OPTIONS,POST'
  response.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Cache-Control, Accept'
end

image_annotator = Google::Cloud::Vision::ImageAnnotator.new(
  credentials: File.new(ENV['GOOGLE_APPLICATION_CREDENTIALS'])
)

get '/' do
  'Yohoo!'
end

post '/upload-image' do
  tempfile = params[:file][:tempfile]
  response = image_annotator.landmark_detection(image: tempfile)

  content_type :json
  response.to_json
end

get '/services/jwt' do
  # https://www.neontsunami.com/posts/using-mapkit-js-with-rails
  headers = {
    alg: 'ES256',
    typ: 'JWT',
    kid: ENV['MAPKIT_JS_KID']
  }
  payload = {
    iss: ENV['APPLE_DEV_TEAM'],
    iat: Time.now.to_i,
    exp: (Date.today + 1).to_time.to_i
  }
  private_key = OpenSSL::PKey::EC.new(
    File.read(ENV['MAPKIT_JS_KEY'])
  )

  JWT.encode(
    payload,
    private_key,
    'ES256',
    headers
  )
end
