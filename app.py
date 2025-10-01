from flask import Flask, render_template, jsonify, request
from maze_logic import generate_solvable_maze, solve_maze

app = Flask(__name__)

maze_data = {}
path_data = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate')
def generate():
    global maze_data, path_data
    maze_data, start, end = generate_solvable_maze()
    path_data = []
    return jsonify({
        'maze': maze_data,
        'start': start,
        'end': end
    })

@app.route('/api/solve', methods=['POST'])
def solve():
    global maze_data, path_data
    data = request.json
    start = tuple(data['start'])
    end = tuple(data['end'])
    path_data = solve_maze(maze_data, start, end)
    return jsonify({
        'path': path_data
    })

if __name__ == "__main__":
    app.run(debug=True)
