#pragma once

#include "ofMain.h"
#include "ofxAruco.h"
#include "ofxMaps.h"
#include "GeoUtils.h"

using namespace ofx;
using namespace std;

class ofApp : public ofBaseApp{

public:
	void setup();
	void update();
	void draw();

	void keyPressed(int key);
	void keyReleased(int key);
	void mouseMoved(int x, int y);
	void mouseDragged(int x, int y, int button);
	void mousePressed(int x, int y, int button);
	void mouseReleased(int x, int y, int button);
	void windowResized(int w, int h);
	void dragEvent(ofDragInfo dragInfo);
	void gotMessage(ofMessage msg);

	ofVideoGrabber grabber;
	ofVideoPlayer player;

	ofBaseVideoDraws * video;

	ofxAruco aruco;
	bool useVideo;
	bool showMarkers;
	bool showBoard;
	bool showBoardImage;
	ofImage board;
	ofImage marker;

	// Maps
	std::string Gd(int zoomLevel, double latitude, double longitude);
	std::vector<Maps::TileLayer::SharedPtr> layers;
	int currentLayer;
};
