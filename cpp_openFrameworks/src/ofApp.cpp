#include "ofApp.h"
#include "ofxCv.h"
#include "ofBitmapFont.h"

void drawMarker(float size, const ofColor & color){
	ofDrawAxis(size);
	ofPushMatrix();
	// move up from the center by size*.5
	// to draw a box centered at that point
	ofTranslate(0, size*0.5, 0);
	ofFill();
	ofSetColor(color, 50);
	ofBox(size);
	ofNoFill();
	ofSetColor(color);
	ofBox(size);
	ofPopMatrix();
}

//--------------------------------------------------------------
void ofApp::setup(){
	ofSetFrameRate(60);
	ofSetVerticalSync(true);
	ofEnableAlphaBlending();

	Poco::ThreadPool::defaultPool().addCapacity(32);

	useVideo = false;
	string boardName = "boardConfiguration.yml";

	if (useVideo){
		player.loadMovie("videoboard.mp4");
		player.play();
		video = &player;
	}
	else{
		//grabber.setDeviceID(1);
		grabber.initGrabber(640, 480);
		video = &grabber;
	}

	//aruco.setThreaded(false);
	aruco.setup("intrinsics.int", video->getWidth(), video->getHeight(), boardName);
	aruco.getBoardImage(board.getPixelsRef());
	board.update();

	showMarkers = true;
	showBoard = true;
	showBoardImage = false;

	ofEnableAlphaBlending();

	/*ofPixels pixels;
	ofBitmapStringGetTextureRef().readToPixels(pixels);
	ofSaveImage(pixels, "font.bmp");*/

	// maps
	/*map.setup(std::shared_ptr<OpenStreetMapProvider>(new OpenStreetMapProvider()),
		ofGetWidth() / 2,
		ofGetHeight() / 2);

	map.setGeoLocationCenter(GeoLocation(43.6244, 7.0306));
	map.setZoom(12);*/

	Geo::Coordinate casa(43.6244, 7.0306);

	layers.push_back(std::make_shared<Maps::TileLayer>());
	layers.push_back(std::make_shared<Maps::TileLayer>());
	layers.push_back(std::make_shared<Maps::TileLayer>());

	layers[0]->setup(std::make_shared<Maps::MicrosoftAerialStyleProvider>(),
		ofGetWidth(),
		ofGetHeight());

	layers[1]->setup(std::make_shared<Maps::EsriSatelliteTileProvider>(),
		ofGetWidth(),
		ofGetHeight());

	layers[2]->setup(std::make_shared<Maps::GoogleAerialTileProvider>(),
		ofGetWidth(),
		ofGetHeight());

	currentLayer = 2;

	for (std::size_t i = 0; i < layers.size(); ++i)
	{
		layers[i]->setCenter(casa, 19);
	}


	cout << "here" << endl;
}

//--------------------------------------------------------------
void ofApp::update(){
	video->update();
	if (video->isFrameNew()){
		//aruco.detectBoards(video->getPixelsRef());
	}
}

//--------------------------------------------------------------
void ofApp::draw(){
	// map
	/*map.draw();

	ofSetColor(255, 127, 255);

	cout << map.getGeoLocationCenter() << endl;

	ofDrawBitmapStringHighlight(ofToString(map.getGeoLocationCenter()),
		ofGetWidth() / 2,
		ofGetHeight() / 2);

	ofVec2d mousePosition(mouseX, mouseY);

	ofDrawBitmapStringHighlight(ofToString(map.pointToTileCoordinate(mousePosition)),
		mouseX + 16,
		mouseY);

	ofDrawBitmapStringHighlight(ofToString(map.pointToGeolocation(mousePosition)),
		mouseX + 16,
		mouseY + 14);

	// video + markers
	ofSetColor(255);
	video->draw(200, 200);	  */
	ofBackgroundGradient(ofColor(255), ofColor(0));

	ofDrawBitmapString(ofToString(layers[0]->getCenter()), ofVec2f(15, 15));

	ofFill();
	ofSetColor(255);

	ofPushMatrix();

	 layers[currentLayer]->draw(0, 0);
	//if (ofGetKeyPressed('0'))
	//{
	//	layers[0]->draw(0, 0);
	//}
	//else if (ofGetKeyPressed('1'))
	//{
	//	layers[1]->draw(0, 0);
	//}
	//else
	//{
	//	//        ofFill();
	//	//        ofSetColor(255, 150);

	//	//        for (std::size_t i = 0; i < layers.size(); ++i)
	//	//        {
	//	layers[ofGetFrameNum() % layers.size()]->draw(0, 0);
	//	//        }
	//}
	ofPopMatrix();
	//aruco.draw();

	/*if (showMarkers){
		for (int i = 0; i<aruco.getNumMarkers(); i++){
			aruco.begin(i);
			drawMarker(0.15, ofColor::white);
			aruco.end();
		}
	}


	if (showBoard && aruco.getBoardProbability()>0.03){
		for (int i = 0; i<aruco.getNumBoards(); i++){
			aruco.beginBoard(i);
			drawMarker(.5, ofColor::red);
			aruco.end();
		}
	}


	ofSetColor(255);
	if (showBoardImage){
		board.draw(ofGetWidth() - 320, 0, 320, 320 * float(board.getHeight()) / float(board.getWidth()));
	}
	ofDrawBitmapString("markers detected: " + ofToString(aruco.getNumMarkers()), 20, 20);
	ofDrawBitmapString("fps " + ofToString(ofGetFrameRate()), 20, 40);
	ofDrawBitmapString("m toggles markers", 20, 60);
	ofDrawBitmapString("b toggles board", 20, 80);
	ofDrawBitmapString("i toggles board image", 20, 100);
	ofDrawBitmapString("s saves board image", 20, 120);
	ofDrawBitmapString("0-9 saves marker image", 20, 140);

	 */
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){
	if (key == 'm') showMarkers = !showMarkers;
	if (key == 'b') showBoard = !showBoard;
	if (key == 'i') showBoardImage = !showBoardImage;
	if (key == 'v') board.saveImage("boardimage.png");
	if (key >= '0' && key <= '9'){
		// there's 1024 different markers
		int markerID = key - '0';
		aruco.getMarkerImage(markerID, 240, marker);
		marker.saveImage("marker" + ofToString(markerID) + ".png");
	}
	if (key == 'f' || key == 'F')
	{
		ofToggleFullscreen();
	}
	else if (key == '-')
	{
		for (std::size_t i = 0; i < layers.size(); ++i)
		{
			layers[i]->setCenter(layers[i]->getCenter().zoomBy(-0.5));
		}
	}
	else if (key == '+')
	{
		currentLayer++;
		if (currentLayer > layers.size() - 1) currentLayer = 0;
	}
	else if (key == '=')
	{
		for (std::size_t i = 0; i < layers.size(); ++i)
		{
			layers[i]->setCenter(layers[i]->getCenter().zoomBy(0.5));
		}
	}
	else if (key == 'w')
	{
		for (std::size_t i = 0; i < layers.size(); ++i)
		{
			layers[i]->setCenter(layers[i]->getCenter().up(0.5));
		}
	}
	else if (key == 'a')
	{
		for (std::size_t i = 0; i < layers.size(); ++i)
		{
			layers[i]->setCenter(layers[i]->getCenter().left(0.5));
		}
	}
	else if (key == 's')
	{
		for (std::size_t i = 0; i < layers.size(); ++i)
		{
			layers[i]->setCenter(layers[i]->getCenter().down(0.5));
		}
	}
	else if (key == 'd')
	{
		for (std::size_t i = 0; i < layers.size(); ++i)
		{
			layers[i]->setCenter(layers[i]->getCenter().right(0.5));
		}
	}
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
std::string ofApp::Gd(int zoomLevel, double latitude, double longitude) {

	double e = 1 << zoomLevel;

	cout << "e=" << e << endl;

	double b = 32 - zoomLevel;

	cout << "b=" << b << endl;

	double Pd = pow(2.0, 32.0) / 360.0;

	unsigned int cx = (Pd * (latitude + 90));
	unsigned int cy = (Pd * (longitude + 180));

	unsigned int xx = e * ((cx >> zoomLevel) + e);
	unsigned int yy = cy >> zoomLevel;

	std::stringstream ss;

	ss << xx << yy;

	cout << "x=" << cx << endl;
	cout << "y=" << cy << endl;
	cout << "xx=" << xx << endl;
	cout << "yy=" << yy << endl;

	return ss.str();

	//        ofVec2d v(Pd * (c + 90) >>> 0, Pd * (d + 180) >>> 0);

	//        return (e * ((c[0] >>> zoomLevel) + e) + (c[1] >>> zoomLevel)).toString(10)
}