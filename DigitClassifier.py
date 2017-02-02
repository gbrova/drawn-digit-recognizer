from keras.models import load_model
import tensorflow as tf
import numpy
import math
import operator

class DigitClassifier():

    IMGSIZE = 28

    def __init__(self):
        self.learned_model = load_model("saved_models/model2.h5")
        self.learned_model_graph = tf.get_default_graph()
        print("Successfully loaded model")

    def classify_proba(self, xs, ys):
        self._verify_input(xs, ys)
        normalized = self._normalize(xs, ys)
        img_matrix = self._make_img_matrix(normalized, size=self.IMGSIZE)

        # %matplotlib inline
        # import matplotlib.pyplot as plt
        # imgplot = plt.imshow(img_matrix, cmap='gray')

        reshaped = img_matrix.reshape(1,1,self.IMGSIZE, self.IMGSIZE)

        # Need to explicitly set the default graph if using across multiple
        # threads (see https://github.com/fchollet/keras/issues/2397)
        with self.learned_model_graph.as_default():
            proba = self.learned_model.predict(reshaped)
            return proba[0]

    def classify(self, xs, ys):
        proba = self.classify_proba(xs, ys)
        max_index, max_value = max(enumerate(proba), key=operator.itemgetter(1))
        return max_index

    def _verify_input(self, xs, ys):
        if len(xs) != len(ys):
            raise ValueError("xs and ys must have the same length")
        if len(xs) == 0 or len(ys) == 0:
            raise ValueError("Input cannot be empty")

    def _normalize_axis(self, vals, maxdiff, border=0.4):
        (vmin, vmax) = (min(vals), max(vals))
        localdiff = vmax - vmin
        offset = (maxdiff - localdiff) / 2
        centered = [val - vmin + offset for val in vals]
        normalized = [val / maxdiff for val in centered]
        with_border = [border/2 + (1-border)*val for val in normalized]
        return with_border

    def _normalize(self, xs, ys):
        xdiff = max(xs) - min(xs)
        ydiff = max(ys) - min(ys)
        maxdiff = max(xdiff, ydiff, 1)
        xs = self._normalize_axis(xs, maxdiff)
        ys = self._normalize_axis(ys, maxdiff)
        return zip(xs, ys)

    def _make_img_matrix(self, points, size=100, line_width=3):
        img = numpy.zeros((size, size))
        eps = 0.00001 # Want to map values in [0, 1] inclusive to [0, size) exclusive.
        for x,y in points:
            xint = int(math.floor(x*size - eps))
            yint = int(math.floor(y*size - eps))
            for xwidth in range(line_width):
                for ywidth in range(line_width):
                    img[yint + ywidth, xint + xwidth] = 1
        return img
