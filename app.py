from flask import Flask, jsonify, render_template, request
app = Flask(__name__)

from DigitClassifier import DigitClassifier

digit_classifier = DigitClassifier()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/digittrace/', methods=['GET'])
def digittrace():
    trace_json = request.args.get('trace')
    ret_data = {
        "proba": get_digit(trace_json),
        "value": None
    }
    return jsonify(ret_data)

def parse_coords_from_json(trace_json):
    import json
    as_json = json.loads(trace_json)
    return (as_json["xs"], as_json["ys"])

def get_digit(trace_json):
    (xs, ys) = parse_coords_from_json(trace_json)

    predicted = digit_classifier.classify_proba(xs, ys).tolist()

    return predicted

if __name__ == '__main__':
    app.run(port=8080, debug=True)
